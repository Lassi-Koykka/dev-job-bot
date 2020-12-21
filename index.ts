import Discord, { Channel, Message, ReactionCollector, ReactionUserManager } from "discord.js";
import glob from "glob";
import { promisify } from "util";

import { Command } from "./types"
import { prefix, token } from './config.json';

const client = new Discord.Client();

//Promisify glob
const globPromise = promisify(glob);

//Array of Commands
const commands: Command[] = [];

//Array of Cooldowns
const cooldowns = new Discord.Collection();

client.once('ready', async () => {

    //Load all JavaScript / TypeScript files
    const commandFiles = await globPromise(`${__dirname}/commands/*{.js,.ts}`);
    console.log('Ready!')

    commandFiles.forEach(async file => {
        const command = await import(file) as Command;
        commands.push(command);
    })

})

client.login(token);

client.on('message', async message => {

    //If the message doesn't start with a prefix, is sent by a bot, or is a direct message.
    if (!message.content.startsWith(prefix)
        || message.author.bot
        || message.channel.type != 'text') return;

    //Get arguments after prefix
    const args = message.content.slice(prefix.length).trim().split(/ +/);

    //Get the first argument as command
    const commandName = args.shift()!.toLowerCase();

    const command = commands.find(c => c.name === commandName);

    if (command) {
        command.execute!(message, args);
    }

})

