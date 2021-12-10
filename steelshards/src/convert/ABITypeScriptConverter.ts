import { ABIInput, JsonABIEntry, ABIField, ABITupleField } from "../components/JsonABI";

/**
 * ABI to TypeScript interface declaration converter
 */
export namespace ABITypeScriptConverter {

    export function enclosing(val: string) { return val.includes(" ")? `(${val})` : val; }
    export const TypeMap: Record<string, string> = {
        byte: "uint8",
        account: "address"
    };

    export function convertField(input: ABIField, opt: InterfaceOptions): string {
        const isArr = input.type.endsWith("[]");
        let type = isArr? input.type.substring(0, input.type.length - 2) : input.type;
        if (TypeMap[type]) type = TypeMap[type];
        if (type == "tuple") return `[${(input as ABITupleField).components.map(v => convertField(v, opt)).join(", ")}]` + (isArr? "[]" : "");
        return isArr? `${enclosing(opt[type + "Type"])}[]` : opt[type + "Type"];
    }

    export function inputParamToTS(input: ABIInput, opt: InterfaceOptions) { return `${input.name}: ` + convertField(input, opt); }

    export function convertABI(
        abi: JsonABIEntry[],
        options: Partial<InterfaceOptions> = {}
    ) {
        let effectiveOptions: InterfaceOptions = {
            interfaceName: "Contract",
            interfacePrefix: "export",
            extractTypes: false,

            addressType: "string | bigint",
            uint256Type: "string | bigint | number",
            uint128Type: "string | bigint | number",
            uint64Type: "string | bigint | number",
            uint32Type: "string | bigint | number",
            uint16Type: "string | bigint | number",
            uint8Type: "string | bigint | number",
            int256Type: "string | bigint | number",
            int128Type: "string | bigint | number",
            int64Type: "string | bigint | number",
            int32Type: "string | bigint | number",
            int16Type: "string | bigint | number",
            int8Type: "string | bigint | number",
            stringType: "string",
            ...options
        };

        let codePrefix = "";
        if (effectiveOptions.extractTypes) {
            codePrefix = [
                `type address = ${effectiveOptions.addressType};`,
                `type uint256 = ${effectiveOptions.uint256Type};`,
                `type uint128 = ${effectiveOptions.uint128Type};`,
                `type uint64 = ${effectiveOptions.uint64Type};`,
                `type uint32 = ${effectiveOptions.uint32Type};`,
                `type uint16 = ${effectiveOptions.uint16Type};`,
                `type uint8 = ${effectiveOptions.uint8Type};`,
                `type uint256 = ${effectiveOptions.int256Type};`,
                `type uint128 = ${effectiveOptions.int128Type};`,
                `type uint64 = ${effectiveOptions.int64Type};`,
                `type uint32 = ${effectiveOptions.int32Type};`,
                `type uint16 = ${effectiveOptions.int16Type};`,
                `type uint8 = ${effectiveOptions.int8Type};`,
                ``,
                ``
            ].join("\n");
            effectiveOptions.addressType = "address";
            effectiveOptions.uint256Type = "uint256";
            effectiveOptions.uint128Type = "uint128";
            effectiveOptions.uint64Type = "uint64";
            effectiveOptions.uint32Type = "uint32";
            effectiveOptions.uint16Type = "uint16";
            effectiveOptions.uint8Type = "uint8";
        }

        return codePrefix + `${effectiveOptions.interfacePrefix} interface ${effectiveOptions.interfaceName} {\n` + abi.map(v => {
            let params: string;
            let outputs: string;

            switch (v.type) {
                case "function":
                    params = v.inputs.map(v => inputParamToTS(v, effectiveOptions)).join(", ");
                    if (v.outputs.length == 0) outputs = "void";
                    else outputs = convertField({
                        type: "tuple",
                        components: v.outputs
                    }, effectiveOptions);
                    return `    ${v.name}(${params}): Promise<${outputs}>;`
                default: return "";
            }
        }).join("\n") + `\n}`;
    }

    export interface InterfaceOptions {
        interfaceName: string;
        interfacePrefix: "export" | "declare";
        extractTypes: boolean;

        addressType: string;
        uint256Type: string;
        uint128Type: string;
        uint64Type: string;
        uint32Type: string;
        uint16Type: string;
        uint8Type: string;
        int256Type: string;
        int128Type: string;
        int64Type: string;
        int32Type: string;
        int16Type: string;
        int8Type: string;
        stringType: string;
    }

}
