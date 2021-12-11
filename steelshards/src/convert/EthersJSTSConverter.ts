import { ABIField, ABIInput, ABITupleField, ABITypeScriptConverter, JsonABIConstructor, JsonABIEntry, JsonABIFunction } from "..";
import { Solc } from "../solc-native/Solc";

function splitSegment(hex: string) {
    let arr: string[] = [];
    while (hex.length > 0) {
        arr.push(hex.substring(0, 256));
        hex = hex.substring(256);
    }
    if (arr.length == 0) arr.push("");
    return arr.map(v => `"${v}"`).join("+\n    ");
}

export namespace EthersJSTSConverter {

    export function convertCode(
        name: string,
        contract: Solc.ContractInfo
    ) {
        let abi = contract.abi as JsonABIEntry[];
        let abiOpt: ABITypeScriptConverter.InterfaceOptions = {
            addressType: "string",
            uint256Type: "bigint",
            uint128Type: "bigint",
            uint64Type: "bigint",
            uint32Type: "bigint",
            uint16Type: "bigint",
            uint8Type: "number",
            int256Type: "bigint",
            int128Type: "bigint",
            int64Type: "bigint",
            int32Type: "bigint",
            int16Type: "bigint",
            int8Type: "number",
            stringType: "string",
            extractTypes: true,
            interfaceName: name,
            interfacePrefix: "export"
        };
        let ctor = abi.find(v => v.type == "constructor") as JsonABIConstructor;
        if (!ctor) ctor = {
            type: "constructor",
            payable: false,
            inputs: []
        };
        let ctorInputs = ctor.inputs.map(v => v.name + ": " + ABITypeScriptConverter.convertField(v, abiOpt));
        let ctorDeployCallInputs = ctor.inputs.map(v => v.name);
        ctorInputs.push("signer?: ethers.Signer");

        let generatedFunctionNames: string[] = [];

        return [
            `// Steelshards Generated Code`,
            `// Edits made in this file will be reverted when you compile your contract,`,
            `// unless you remove the TypeScript code generation option in outputs section`,
            ``,
            `import * as ethers from "ethers";`,
            ``,
            `const ABI = ${JSON.stringify(contract.abi)};`,
            `const BYTECODE = ${splitSegment(contract.evm.bytecode.object)};`,
            ``,
            `function mapOutput(v: any) {`,
            `    if (v instanceof ethers.BigNumber) return v.toBigInt();`,
            `    if (v instanceof Array) return v.map(mapOutput);`,
            `    return v;`,
            `}`,
            ``,
            `export class ${name} {`,
            ``,
            `    readonly underlying: ethers.Contract;`,
            `    get address() { return this.underlying.address; }`,
            ``,
            `    constructor(address: string, providerOrSigner?: ethers.providers.Provider | ethers.Signer);`,
            `    constructor(underlying: ethers.Contract);`,
            `    constructor(a: string | ethers.Contract, providerOrSigner?: ethers.providers.Provider | ethers.Signer) {`,
            `        if (typeof a == "string") this.underlying = new ethers.Contract(a, ABI, providerOrSigner);`,
            `        else this.underlying = a;`,
            `    }`,
            ``,
            `    static async deploy(${ctorInputs.join(", ")}): Promise<${name}> {`,
            `        let factory = new ethers.ContractFactory(ABI, BYTECODE, signer);`,
            `        let underlying = await factory.deploy(${ctorDeployCallInputs.join(", ")});`,
            `        return new ${name}(underlying);`,
            `    }`,
            ``,
            `    connect(providerOrSigner: ethers.providers.Provider | ethers.Signer) {`,
            `        let newUnderlying = this.underlying.connect(providerOrSigner);`,
            `        return new ${name}(newUnderlying);`,
            `    }`,
            ``,
            ...abi.filter(v => v.type == "function").map((v: JsonABIFunction) => {
                let funcName = v.name;
                if (generatedFunctionNames.includes(funcName)) {
                    let counter = 0;
                    while (generatedFunctionNames.includes(funcName = v.name + counter)) counter++;
                }
                generatedFunctionNames.push(funcName);

                let functionInputs = v.inputs.map((v, i) => (v.name || "arg" + i) + ": " + ABITypeScriptConverter.convertField(v, abiOpt));
                functionInputs.push("overrides?: ethers.Overrides");
                let functionCallInputs = v.inputs.map(v => v.name);

                let returnValue: string;
                let body = ["return null;"];
                function convertABIForReturn(abi: ABIField) {
                    const isArr = abi.type.endsWith("[]");
                    const realType = isArr? abi.type.substring(0, abi.type.length - 2) : abi.type;
                    if (isArr) return convertABIForReturn(<any> { ...abi, type: realType }) + "[]";
                    if (realType == "tuple") {
                        return `[${(abi as ABITupleField).components.map(v => convertABIForReturn(v)).join(", ")}]`;
                    }
                    if (realType.startsWith("uint") || realType.startsWith("int")) return "bigint";
                    if (realType == "address" || realType == "account") return "string";
                    if (realType == "bool") return "boolean";
                    return realType;
                }
                function convertABIForMapping(v: ABIInput, i: number) {
                    const argName = v.name || ("arg" + i);
                    const isArr = v.type.endsWith("[]");
                    const realType = isArr? v.type.substring(0, v.type.length - 2) : v.type;
                    if (isArr) return `    [],`;
                    if (realType == "tuple") return `    [${(v as ABITupleField).components.map(convertABIForMapping).join(", ")}],`;
                    if (realType.startsWith("uint") || realType.startsWith("int")) return `    ethers.BigNumber.from(${argName}),`;
                    if (realType == "string" || realType == "address") return `    ${argName},`;
                    return `    ${argName}, /* ${v.type} */`;
                }
                if (v.stateMutability == "view" || v.stateMutability == "pure") {
                    // Read only - Return values anyways
                    let ret: ABIField;
                    if (v.outputs.length == 1) ret = v.outputs[0];
                    else ret = <ABITupleField> {
                        type: "tuple",
                        components: v.outputs
                    };
                    returnValue = convertABIForReturn(ret);
                    body = [
                        `let result = await this.underlying.${v.name}(`,
                        ...v.inputs.map(convertABIForMapping),
                        `    overrides`,
                        `).map(mapOutput);`
                    ];
                    body.push(`return result;`);
                } else {
                    returnValue = "ethers.providers.TransactionResponse";
                    body = [
                        `return await this.underlying.${v.name}(`,
                        ...v.inputs.map(convertABIForMapping),
                        `    overrides`,
                        `);`
                    ];
                }
                return `async ${funcName}(\n        ${functionInputs.join(",\n        ")}\n    ): Promise<${returnValue || "void"}> {\n${body.map(v => `        ` + v).join("\n")}\n    }`;
            }).map(v => `    ${v}\n`),
            `}`,
            ``,
        ];
    }

}