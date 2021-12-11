import * as fs from "fs";
import * as path from "path";
import { ABITypeScriptConverter } from "..";
import { EthersJSTSConverter } from "../convert/EthersJSTSConverter";
import { BuildError } from "../errors/BuildError";
import { Solc } from "../solc-native/Solc";
import { CLI } from "./CLI";

// Since this isn't incremental build, it will perform slower

function trimExtension(file: string) {
    let s = file.split(".");
    if (s.length > 1) s.pop();
    else return file;
    return s.join(".");
}

function findImports(code: string, dir: string, inputMapping: string, solcInput: Solc.CompilerSolidityInput) {
    let importStatements = code.split("\n").map(v => v.trim()).filter(v => (
        (v.startsWith(`import "`) && v.endsWith(`";`)) ||
        (v.startsWith(`import '`) && v.endsWith(`';`))
    )).map(v => [v, v.substring(8, v.length - 2)]);
    importStatements.forEach(v => {

        const [sourceStatement, source] = v;
        let realFilePath: string, mappedFilePath: string, isModuleImport = false;
        if (source.startsWith("@") || !source.startsWith(".")) {
            realFilePath = mappedFilePath = "node_modules/" + source;
            isModuleImport = true;
        } else {
            realFilePath = path.join(dir, source);
            mappedFilePath = path.join(inputMapping, source).replaceAll("\\", "/");
        }

        code = code.replaceAll(sourceStatement, `import "${mappedFilePath}";`);
        if (solcInput.sources[mappedFilePath]) return;
        solcInput.sources[mappedFilePath] = { content: "// No Source" };

        if (!fs.existsSync(realFilePath)) throw new BuildError("Error while resolving imports: File not found: " + realFilePath, null);
        let fileContents = fs.readFileSync(realFilePath, "utf-8");
        fileContents = findImports(fileContents, path.join(realFilePath, ".."), path.join(mappedFilePath, "..").replaceAll("\\", "/"), solcInput);
        solcInput.sources[mappedFilePath] = { content: fileContents };

    });
    return code;
}

function insertSources(dir: string, inputMapping: string, solcInput: Solc.CompilerSolidityInput) {
    const contents = fs.readdirSync(dir);
    contents.forEach(file => {
        const fsPath = path.resolve(dir, file);
        const vfsPath = path.join(inputMapping, file);
        if (fs.statSync(fsPath).isDirectory()) {
            insertSources(fsPath, vfsPath, solcInput);
        } else {
            let source = fs.readFileSync(fsPath, "utf-8");
            source = findImports(source, dir, inputMapping, solcInput);
            solcInput.sources[vfsPath] = { content: source };
        }
    });
}

function saveFile(basepath: string, file: string, data: string, noEmit: boolean) {
    if (noEmit || !basepath) return;
    fs.writeFileSync(path.join(basepath, file), data, { encoding: "utf-8" });
}

export async function Build(noEmit = false) {

    const config = CLI.getConfig();
    if (!config) return;
    
    fs.mkdirSync(config.inputs, { recursive: true });
    fs.mkdirSync(config.outputs.json, { recursive: true });
    fs.mkdirSync(config.outputs.ts, { recursive: true });

    let solcInput: Solc.CompilerSolidityInput = {
        language: "Solidity",
        sources: {},
        settings: {
            outputSelection: {
                '*': {
                    '*': ["*"]
                }
            }
        }
    };
    try {
        insertSources(config.inputs, "", solcInput);
    } catch (e) {
        if (e instanceof BuildError) {
            CLI.error(e.message);
            if (e.sourceFile) CLI.error(`-> ${e.sourceFile}`);
            return;
        } else throw e;
    }

    CLI.info("Compiling...");
    let compileResult: Solc.CompilerOutput = await Solc.compile(solcInput);
    let errorTriggered = false;
    if (compileResult.errors) compileResult.errors.forEach(err => {
        if (err.message.length > 250) err.message = err.message.substring(0, 250) + "...";
        const srcLoc = err.sourceLocation? err.sourceLocation.file : "contract";
        function findLines(): [number, string][] {
            const start = err.sourceLocation.start;
            const end = err.sourceLocation.end;
            const source = solcInput.sources[err.sourceLocation.file].content;
            if (start == -1 || end == -1) return [];
            
            function findLine(l: number): number {
                let src = source.split("\n");
                let idx = 0;
                while (l > src[idx].length) {
                    l -= src[idx].length + 1;
                    idx++;
                }
                return idx;
            }

            const startLine = findLine(start);
            const endLine = findLine(end);
            let out: [number, string][] = [];
            let src = source.split("\n").map(v => v.trim());
            for (let i = startLine; i <= endLine; i++) {
                const line = src[i];
                out.push([i + 1, line]);
            }
            return out;
        }
        const srcTarget = err.sourceLocation? findLines() : null;

        if (err.severity == "error") {
            errorTriggered = true;
            CLI.error("Error while compiling " + srcLoc + ": " + err.message);
        }
        if (err.severity == "warning") CLI.warn("Warning while compiling " + srcLoc + ": " + err.message);
        if (srcTarget) srcTarget.forEach(v => {
            CLI.println(` \x1b[96m${v[0].toString().padStart(3, " ")} \x1b[90m| \x1b[0m${v[1]}`);
        });
    });
    if (errorTriggered) return;

    Object.keys(compileResult.contracts).forEach(key => {
        const fileContent = compileResult.contracts[key];

        Object.keys(fileContent).forEach(key2 => {
            const contract = fileContent[key2];
            let tsOutput: string;
            if (config.codeGenerationTarget == "none") tsOutput = ABITypeScriptConverter.convertABI(contract.abi, {
                interfaceName: key2,
                extractTypes: true,
                interfacePrefix: "export"
            });
            else if (config.codeGenerationTarget == "ethers.js") {
                tsOutput = EthersJSTSConverter.convertCode(key2, contract).join("\n");
            }

            saveFile(config.outputs.json, key2 + ".json", JSON.stringify(contract), noEmit);
            saveFile(config.outputs.ts, key2 + ".ts", tsOutput, noEmit);
        });
    });
    
    CLI.info("Compile finished!");
    return compileResult;

}
