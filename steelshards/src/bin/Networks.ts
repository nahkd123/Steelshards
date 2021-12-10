import { CLI } from "./CLI";

export function Networks() {

    const config = CLI.getConfig();
    if (!config) return;

    CLI.println("\x1b[96mAvailable Networks:\x1b[0m");
    if (config.networks) config.networks.forEach((net, idx) => {
        CLI.println(` \x1b[90m${idx + 1}. \x1b[0m${net.name} \x1b[90m(\x1b[93m${net.networkID}\x1b[90m) \x1b[90m[\x1b[96m${net.rpc}\x1b[90m]\x1b[0m`);
        if (net.wallet) CLI.println(`   This network configuration has wallet`);
    });
    else CLI.println(" \x1b[90m1. \x1b[0m(no networks found)");

}