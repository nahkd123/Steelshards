# Using Steelshards REPL
Steelshards contains a REPL console for you to interact with. You can open the REPL by using ``repl`` subcommand:

```sh
steelshards repl
```

If you run this command in the project root, it will load the configuration file.

Since it's basically NodeJS REPL, you can use ``require()`` or NodeJS REPL commands (``.exit`` for example)

## Building contracts
You can use REPL console to build contracts, beside from ``steelshards build``:

```js
await ss.build()
```

This will build all the Solidity files and store all the outputs on the memory. You can view the ``solc`` output by looking at previous build information:

```js
ss.previousBuild
```

## Deploying contracts
Once the contracts are built, it's time to deploy it to network:

```js
await ss.deploy("<Contract Name Here>")
```

The contract name is the name of the contract, not the name of the file. So if your contract is named ``MyContract``, you have to type ``MyContract``, not ``MyContract.sol``

If your contract has constructor arguments, you can put arguments to it:

```js
await ss.deploy("MyContract", true, ethers.BigNumber.from(1235n))
```

## Interacting with contract
Once the contract is deployed, you can interact with it by accessing ``ss.deployedContracts``:

```js
await ss.deployedContracts.MyContract.giveMeAnswer(42)
// -> ethers.BigNumber: 42
```

These are ``ethers.js`` contract objects, so you can put overrides after it.

## Switching node
To switch node, you can assign a new object to ``ss.network``:

```js
ss.network = {
    name: 'My Network',
    networkID: 31337,
    rpc: 'http://localhost:8545'
}
```

## Switching wallet
To switch wallet, you can assigned a new object to ``ss.wallet``:

```js
ss.wallet = {
    displayName: "My Wallet",

    // Not a real private key
    privateKey: "0xdeadbeef4201337"
}
```

> These network and wallet configurations won't be saved in ``steelshards.json``

## Reload configuration
Configuration can be reloaded by using ``ss.reloadConfig()``:

```js
ss.reloadConfig()
```

> This won't reload selected node and wallet