export type ABITupleField = {
    type: "tuple" | "tuple[]",
    components: ABIField[],
    indexed?: boolean
}
export type ABIRegularField = {
    type: `${"address" | `uint${number}` | "account"}${"[]" | ""}`,
    indexed?: boolean
}
export type ABIField = ABITupleField | ABIRegularField;
export type ABIInput = ABIField & { name: string }

export type JsonABIConstructor = {
    type: "constructor",
    payable: boolean,
    inputs: ABIInput[]
}
export type JsonABIFunction = {
    type: "function",
    name: string,

    constant: boolean,
    stateMutability?: "view" | "pure" | "nonpayable" | "payable",

    payable: boolean,
    inputs: ABIInput[],
    outputs: ABIField[]
}
export type JsonABIEvent = {
    type: "event",
    anonymous: boolean,
    name: string,
    inputs: ABIInput[]
}
export type JsonABIError = {
    type: "error",
    name: string,
    inputs: ABIInput[]
}

export type JsonABIEntry = JsonABIConstructor | JsonABIFunction | JsonABIEvent | JsonABIError;
