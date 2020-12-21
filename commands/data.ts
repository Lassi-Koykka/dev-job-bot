import { Command } from '../types';
import getErrString from '../getErrString'
import { MessageEmbed } from "discord.js";
const paginationEmbed = require("discord.js-pagination");
import axios from 'axios';

const data: Command = {
    name: "data",
    description: "",
    usage: "",
    minArgs: 1,
    cooldown: 0,
    execute(message, args) {
        if(args[0] == 'technologies'){
            axios.get("http://dev-job-api.herokuapp.com/api/data/technologies").then(async response => {
                //TODO muokkaa API:ssa tän jsonin muotoa
            })
        }
        

        //If the user supplies the command with invalid argument
        return message.channel.send(getErrString(this, args));
    }
}