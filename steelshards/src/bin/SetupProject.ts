import * as fs from "fs";
import { SteelshardsConfig } from "../components/SteelshardsConfig";
import { CLI } from "./CLI";

const SAMPLE_CONFIG = JSON.stringify(<SteelshardsConfig> {
    networks: [
        {
            name: "Private Network",
            networkID: 1337,
            rpc: "http://localhost:8545"
        }
    ],
    inputs: "contracts/",
    outputs: {
        json: "dist/json/",
        ts: "ts/interfaces/"
    },
    codeGenerationTarget: "none"
}, null, 4);
const TSCONFIG = JSON.stringify({
    compilerOptions: {
        module: "commonjs",
        target: "ESNext",
        outDir: "dist/tsc",
        declaration: true
    },
    include: ["ts/"],
    exclude: ["node_modules"]
}, null, 4);
const GIT_IGNORES = [
    "/node_modules",
    "/dist",
    "/ts/interfaces"
];

const SAMPLE_CONTRACT = [
    `// SPDX-License-Identifier: UNLICENSED`,
    `pragma solidity >=0.8.0;`,
    ``,
    `contract MyContract {`,
    `    `,
    `    constructor() {`,
    `        // Enter your code...`,
    `    }`,
    `    `,
    `}`
].join("\n");

export function SetupProject() {
    CLI.info("Setting up project...");
    CLI.info("You'll use the default project template.");

    if (fs.existsSync("steelshards.json")) {
        CLI.error("Failed to setup project: steelshards.json already exists!");
        return;
    }

    fs.mkdirSync("contracts/", { recursive: true });
    fs.mkdirSync("ts/interfaces/", { recursive: true });
    fs.writeFileSync("contracts/MyContract.sol", SAMPLE_CONTRACT, { encoding: "utf-8" });
    fs.writeFileSync("steelshards.json", SAMPLE_CONFIG, { encoding: "utf-8" });
    fs.writeFileSync("tsconfig.json", TSCONFIG, { encoding: "utf-8" });
    fs.writeFileSync(".gitignore", GIT_IGNORES.join("\n"), { encoding: "utf-8" });

    CLI.info("Project created!");
}
