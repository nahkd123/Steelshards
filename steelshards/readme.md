# Steelshards (WIP)
Welcome to Steelshards! Steelshards is designed to help you create smart contracts and dApps, using TypeScript with the help of code generation.

## Getting Started
```sh
# Install Steelshards
# The project is currently WIP, so the command below won't work
# npm i -g @steelshards/steelshards

# Create new project
steelshards init

# Build the project
steelshards build
```

## Features
- TypeScript code generation
- REPL console

## Requirements
- Solidity compiler (must be installed system-wide)
- NodeJS 15 or higher

## FAQ
### Why native compiler?
The ``solc-js`` is really slow comparing to native compiler, and it causes to REPL, making it less interactive.
