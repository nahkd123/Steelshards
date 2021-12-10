import * as fs from "fs";
import { SteelshardsConfig } from "../components/SteelshardsConfig";

export namespace CLI {

    export function println(msg: string) { process.stdout.write(msg + "\n"); }

    export function info(msg: string) { process.stdout.write(`\x1b[96m info  \x1b[0m${msg}\n`); }
    export function warn(msg: string) { process.stdout.write(`\x1b[93m warn  ${msg}\x1b[0m\n`); }
    export function error(msg: string) { process.stdout.write(`\x1b[91m error ${msg}\x1b[0m\n`); }

    export function getConfig(): SteelshardsConfig {
        if (!fs.existsSync("steelshards.json")) {
            CLI.error("Failed to setup project: steelshards.json doesn't exists");
            CLI.error("Please make sure you're currently in project root");
            return null;
        }
        return JSON.parse(fs.readFileSync("steelshards.json", "utf-8"));
    }

}
