export interface SteelshardsConfig {
    networks: NetworkConfig[];
    inputs: string;
    outputs: {
        json?: string;
        ts?: string;
    };
    codeGenerationTarget: "none" | "ethers.js";
}

export interface NetworkConfig {
    name: string;
    rpc: string;
    networkID: number;
    wallet?: PerNetworkWallet;
}
export interface PerNetworkWallet {
    displayName?: string;
    privateKey?: string;
    seedPhrase?: string;
}