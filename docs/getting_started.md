# Getting Started with Steelshards
## Requirements
- System-wide Solidity compiler (``solc``)
> You can use the native library or ``solc-js``, but I would choose ``solc`` native binary because it compiles very fast.
- NodeJS 15 or higher

We'll assume that you already know a bit of Solidity. If you want to learn more about Solidity, see the [official documentation](https://docs.soliditylang.org/en/v0.8.10)

## Installing Steelshards
Steelshards can be installed by using ``npm install`` command:

```sh
npm i -g @steelshards/steelshards
```

This will install the CLI so you can work with your project.

## Creating Steelshards project
To create a new project, type ``steelshards init``. This will create all the files that's needed to create dApp, including ``steelshards.json`` configuration file.

```sh
steelshards init
vim steelshards.json
```

## Working with configuration file
``steelshards.json`` contains all informations for building and deploying contracts, such as networks, deploy wallet, input/output path.

> A good security practice is to keep private key and seed phrase as secure as possible. This includes not putting them inside configuration file. Instead, you can unlock the account in your node (in geth, it's ``geth --unlock``). Steelshards will use the unlocked account in your node (if any) to deploy and interact with contracts.

The initial configuration will look similar to this:
```json
{
    "networks": [
        {
            "name": "Private Network",
            "networkID": 1337,
            "rpc": "http://localhost:8545"
        }
    ],
    "inputs": "contracts/",
    "outputs": {
        "json": "dist/json/",
        "ts": "ts/generated/"
    },
    "codeGenerationTarget": "none"
}
```

- ``network``: An array of networks to choose. Steelshards will use the first one by default
  + ``name``: The network name, which will be displayed in some places
  + ``networkID``: The network ID. This value must matchs with the node network ID to connect
  + ``rpc``: The JSON-RPC URL
- ``inputs``: The input directory that contains Solidity source code
- ``outputs``: The output directories configuration
  + (Optional) ``json``: JSON output
  + (Optional) ``ts``: Generated TypeScript output
- ``codeGenerationTarget``: TypeScript code generation target (``none`` or ``ethers.js``)

## Build contracts
Once you're done with contracts, you can build them and look for error messages. It will also emit outputs, such as JSON or TypeScript.

Build them with ``steelshards build``:

```sh
steelshards build

# If you use TypeScript code generation:
tsc
```

## Build & Deploy contracts
You can also build and deploy contracts by using REPL console:

```sh
steelshards repl
```

The terminal should look like this:

```

    ####     ####    Steelshards Console
  ###  ### ###  ###  Using NodeJS REPL as backend
  ##       ##        
   ######   ######   Type help() to view help
        ##       ##  
  ###  ### ###  ###  
    ####     ####    

SS >
```

As the welcome message stated, typing ``help()`` will give you help messages.

To build with REPL, type ``await ss.build()``. It will achieve the same effect as using ``steelshards build``. To deploy, make sure you're connected to your node, then type ``await ss.deploy("<Contract Name>")``:

```js
await ss.build()
await ss.deploy("MyContract")
```

Once the contract is deployed, you should see something like this:

```
 info  Using wallet unlocked in node
 info  Set wallet configuration in your config file to override
 info  Contract deployed!
 info    Artifact       MyContract
 info    Address        0xfcBD80Ff6f756b1A88CE175Ab20b51E44bc4A6A4
 info    (use ss.deployedContracts.MyContract to access it later)
 info  
```