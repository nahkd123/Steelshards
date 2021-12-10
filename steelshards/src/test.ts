import { ABITypeScriptConverter } from "./convert/ABITypeScriptConverter";

console.log(ABITypeScriptConverter.convertABI([
    {
        type: "constructor",
        payable: false,
        inputs: []
    },
    {
        type: "function",
        name: "myFunction",
        constant: false,
        payable: false,
        inputs: [
            { type: "uint256", name: "message" },
            { type: "uint8[]", name: "binary" },
            { type: "tuple", name: "test", components: [ { type: "uint8" }, { type: "uint8[]" } ] }
        ],
        outputs: []
    }
], {
    extractTypes: true
}));
