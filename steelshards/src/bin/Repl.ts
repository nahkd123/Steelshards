import * as repl from "repl";
import * as ethers from "ethers";
import { NetworkConfig, PerNetworkWallet, SteelshardsConfig } from "../components/SteelshardsConfig";
import { Solc } from "../solc-native/Solc";
import { Build } from "./Build";
import { CLI } from "./CLI";

function breadcumb(...breadcumb: string[]) {
    let o = "\x1b[93m" + breadcumb[0];
    for (let i = 1; i < breadcumb.length; i++) o += " \x1b[90m> \x1b[96m" + breadcumb[i];
    CLI.println(o + "\x1b[0m");
}

globalThis.help = function() {
    breadcumb("Steelshards Console", "Help");
    CLI.println(`  Welcome to Steelshards Console, the smart contracts development console.`);
    CLI.println(`  You can run functions to build, test or deploy contracts.`);
    CLI.println(`  All Steelshards functions are located in \x1b[93msteelshards \x1b[90m| \x1b[93mss \x1b[0mnamespace.`);
    CLI.println(``);
    CLI.println(`  Build your project: \x1b[96mss.build()\x1b[0m`);
    CLI.println(`  Deploy your contract: \x1b[96mss.deploy("<Contract Name>", /* Ctor arguments... */)\x1b[0m`);
    CLI.println(`  Access ethers.js: \x1b[96methers\x1b[0m`);
    CLI.println(``);
}

namespace Steelshards {

    export let config: SteelshardsConfig;
    export let previousBuild: Solc.CompilerOutput;
    export let network: NetworkConfig;
    export let wallet: PerNetworkWallet;
    export let deployedContracts: Record<string, ethers.Contract> = {};

    export function reloadConfig() {
        config = CLI.getConfig();
        CLI.info("Configuration reloaded");
    }
    export function build(noEmit?: boolean) {
        let p = Build(noEmit);
        p.then(out => previousBuild = out);
        return p;
    }
    export function getArtifact(name: string) {
        if (!previousBuild) {
            CLI.error("Please build the project first");
            return;
        }
        if (!name) {
            CLI.error("Please include the contract name");
            CLI.error("Function signature: getArtifact(name: string)");
            return;
        }

        const files = Object.keys(previousBuild.contracts);
        for (let i = 0; i < files.length; i++) {
            const file = previousBuild.contracts[files[i]];
            if (file[name]) return file[name];
        }

        CLI.error("Contract not found: " + name);
    }
    export async function deploy(artifactName: string, ...args: any[]) {
        if (!network) {
            CLI.error("Network configuration not selected");
            CLI.error("Set the ss.network with network configuration to continue");
            return;
        }

        const artifact = getArtifact(artifactName);
        const provider = new ethers.providers.JsonRpcProvider(network.rpc);
        let signer: ethers.Signer;
        if (wallet) {
            CLI.info("Using wallet from configuration");
        } else {
            const nodeAccounts = (await provider.listAccounts())[0];
            if (nodeAccounts.length > 0) {
                CLI.info("Using wallet unlocked in node");
                CLI.info("Set wallet configuration in your config file to override");
                signer = provider.getSigner(0);
            } else {
                CLI.error("No wallet configuration selected");
                CLI.error("Set the ss.wallet with wallet configuration to continue");
                CLI.error("You can also unlock your account in your node instead");
                return;
            }
        }

        let factory = new ethers.ContractFactory(artifact.abi, artifact.evm.bytecode, signer);
        let contract = await factory.deploy(...args);
        await contract.deployed();
        CLI.info("Contract deployed!");
        CLI.info("  Artifact       " + artifactName);
        CLI.info("  Address        " + contract.address);
        CLI.info("  (use \x1b[96mss.deployedContracts." + artifactName + "\x1b[0m to access it later)");
        CLI.info("");
        deployedContracts[artifactName] = contract;
    }
    export async function fromAddress(artifactName: string, address: string) {
        if (!network) {
            CLI.error("Network configuration not selected");
            CLI.error("Set the ss.network with network configuration to continue");
            return;
        }

        const artifact = getArtifact(artifactName);
        const provider = new ethers.providers.JsonRpcProvider(network.rpc);
        let signer: ethers.Signer;
        if (wallet) {
            CLI.info("Using wallet from configuration");
        } else {
            const nodeAccounts = (await provider.listAccounts())[0];
            if (nodeAccounts.length > 0) {
                CLI.info("Using wallet unlocked in node");
                CLI.info("Set wallet configuration in your config file to override");
                signer = provider.getSigner(0);
            } else {
                CLI.error("No wallet configuration selected");
                CLI.error("Set the ss.wallet with wallet configuration to continue");
                CLI.error("You can also unlock your account in your node instead");
                return;
            }
        }
        return new ethers.Contract(address, artifact.abi, signer);
    }

}
globalThis.steelshards = globalThis.ss = Steelshards;
globalThis.ethers = ethers;

export function Repl() {

    Steelshards.config = CLI.getConfig();
    if (Steelshards.config) {
        Steelshards.network = Steelshards.config.networks[0];
        if (Steelshards.network && Steelshards.network.wallet) Steelshards.wallet = Steelshards.network.wallet;
    }

    CLI.println(``);
    CLI.println(`  \x1b[93m  ####     ####    \x1b[0mSteelshards Console`);
    CLI.println(`  \x1b[93m###  ### ###  ###  \x1b[0mUsing NodeJS REPL as backend`);
    CLI.println(`  \x1b[93m##       ##        \x1b[0m`);
    CLI.println(`  \x1b[93m ######   ######   \x1b[0mType \x1b[96mhelp()\x1b[0m to view help`);
    CLI.println(`  \x1b[93m      ##       ##  \x1b[0m`);
    CLI.println(`  \x1b[93m###  ### ###  ###  \x1b[0m`);
    CLI.println(`  \x1b[93m  ####     ####    \x1b[0m`);
    CLI.println(``);
    repl.start("SS > ");

}
