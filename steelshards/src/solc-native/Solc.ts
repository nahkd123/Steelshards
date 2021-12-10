import * as childProcess from "child_process";
import { JsonABIEntry } from "..";

export namespace Solc {

    export async function compile(input: CompilerSolidityInput) {
        let proc = childProcess.exec("solc --standard-json --allow-paths ./node_modules/", {
            encoding: <BufferEncoding> "utf-8",
            maxBuffer: 1024 * 1024 * 1024,
        });
        let jsonString = "";
        proc.stdout.on("data", (chunk: string) => {
            jsonString += chunk;
        });
        let p = new Promise<void>(resolve => proc.stdout.on("end", resolve));
        proc.stdin.write(JSON.stringify(input));
        proc.stdin.end();
        await p;
        return JSON.parse(jsonString);
    }

    export interface CompilerSolidityInput {
        language: "Solidity";
        sources: Record<string, SourceInput>;
        settings?: {
            stopAfter?: "parsing";
            remappings?: string[];
            optimizer?: {
                enabled: boolean;
                runs: number;
                details: {
                    peephole: boolean;
                    inliner: boolean;
                    jumpdestRemover: boolean;
                    orderLiterals: boolean;
                    deduplicate: boolean;
                    cse: boolean;
                    constantOptimizer: boolean;
                    yul: boolean;
                    yulDetails?: {
                        stackAllocation: boolean;
                        optimizerSteps: string;
                    }
                };
            };
            outputSelection?: any;
        };
        evmVersion?: "tangerineWhistle" | "spuriousDragon" | "byzantium" | "constantinople" | "petersburg" | "istanbul" | "berlin";
        viaIR?: boolean;
    }

    export interface SourceInput {
        keccak256?: string;
        urls?: string[];
        content?: string;
    }

    export interface CompilerOutput {
        errors?: {
            sourceLocation?: { file: string; start: number; end: number; };
            secondarySourceLocation?: { file: string; start: number; end: number; message: string; };
            type: `${
                "JSON" | "IO" | "Parser" | "DocstringParsing" | "Syntax" | "Declaration" |
                "Type" | "UnimplementedFeature" | "InternalCompiler" | "Compiler" | "Fatal"
            }Error` | "Exception" | "Warning" | "Info";
            component: string;
            severity: "info" | "warning" | "error";
            error: `${number}`;
            message: string;
            formattedMessage: string;
        }[];
        sources: Record<string, {
            id: number;
            ast: any;
        }>;
        contracts: Record<string, Record<string, ContractInfo>>;
    }

    export interface ContractInfo {
        abi: JsonABIEntry[];
        metadata: string;
        userdoc: any;
        devdoc: any;
        ir: string;
        storageLayout: StorageLayout;
        evm: EVM;
        ewasm: EWASM;
    }

    export interface EVM {
        assembly: string;
        legacyAssembly: object;
        bytecode: EVMBytecode;
        deployedBytecode: EVMBytecode;
        methodIdentifiers: Record<string, string>;
        gasEstimates: object;
    }

    export interface EWASM {
        wast: string;
        wasm: string;
    }

    export interface EVMBytecode {
        functionDebugData: Record<string, {
            entryPoint: number;
            id: number;
            parameterSlots: number;
            returnSlots: number;
        }>;
        object: string;
        opcodes: string;
        sourceMap: string;
        generatedSources: object[];
    }

    export interface StorageLayout {
        storage: any[];
        types: any;
    }

}
