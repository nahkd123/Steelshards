import { Build } from "./Build";
import { CLI } from "./CLI";
import { Networks } from "./Networks";
import { Repl } from "./Repl";
import { SetupProject } from "./SetupProject";

const args = process.argv.splice(2);

async function main() {

    if (args.length == 0) {
        CLI.println("Steelshards CLI - Quick Help");
        CLI.println("Usage: steelshards <Subcommand> [...Options]");
        CLI.println("");
        CLI.println("Subcommands:");
        CLI.println("   init | setup       Setup new project at current directory");
        CLI.println("   build              Build project");
        CLI.println("   networks           View available networks");
        CLI.println("   console | repl     Open development console");
        CLI.println("");
        return;
    }

    const subcommand = args[0];
    switch (subcommand) {
        case "init":
        case "setup": SetupProject(); return;
        case "build": await Build(); return;
        case "network":
        case "networks": Networks(); return;
        case "console":
        case "repl": Repl(); return;
        default: CLI.error(`Unknown subcommand: ${subcommand}`); return;
    }
}

main();
