<div align="center">

# SLAM
[![CI](https://github.com/rwilliaise/slam/actions/workflows/ci.yml/badge.svg)](https://github.com/rwilliaise/slam/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/rwilliaise/slam/badge.svg?branch=master)](https://coveralls.io/github/rwilliaise/slam?branch=master)
![Discord](https://img.shields.io/discord/839895703379247114)
![GitHub](https://img.shields.io/github/license/rwilliaise/slam)
![GitHub package.json version](https://img.shields.io/github/package-json/v/rwilliaise/slam)
</div>

A fighting game. The entire codebase is in TypeScript for ease of use purposes. All other code is in lua due to limitations within roblox-ts.

## Building And Running

### Prerequsites

- npm (>=6.0.0) at [nodejs.org](https://nodejs.org)
- rojo (>=6.0.0) at [crates.io](https://crates.io/crates/rojo), [rojo.space](https://rojo.space), or [VSCode extension](https://marketplace.visualstudio.com/items?itemName=evaera.vscode-rojo)

### Build

If this is your first time building, please install all required packages:

```
npm install
```

To build a place file, run

```
npm run make
```

This should run the compiler and build a place file with the codebase. The place file should be located within the root folder, called `slam.rbxlx`.
If you do not have Rojo, please get it from [crates.io](https://crates.io/crates/rojo) or [rojo.space](https://rojo.space). You may also use the VSCode extension.

## Development Version

There are two different compilations: `production` and `development`. All `development` builds includes useful debugging info that should not interfere with gameplay.
To build a dev version, simply append `:dev` to any scripts.

```
npm run make:dev
```

A useful command is

```
npm run watch
rojo serve 
```

This will automatically sync the code into studio with the Rojo plugin.
