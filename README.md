# DictatorBot2
DictatorBot2 is a continuation of [DictatorBot](https://github.com/CodexScript/DictatorBot) in TypeScript.

# Setup
All of the following steps assume you are cloning from master and building the TypeScript code into JavaScript in the output folder `dist`.
## Configuration
* Run `yarn install` if this is your first time building
* Run `yarn build`
* Copy the assets folder from `src` into `dist`. 
* Create a new file called `config.yml` in `dist`. See [Configuration](https://github.com/CodexScript/DictatorBot2/wiki/Configuration) for information about setting the appropriate values in this file.
## Running
* Run `node .` in the `dist` directory
* Optionally, instead run `node . --force-sync` in order to push slash commands to the Discord API endpoint. You should do this if you are running the bot for the first time or if you have modified the source code to change command information.