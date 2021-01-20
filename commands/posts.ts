import { Post, Command } from "../types"
import { MessageEmbed } from "discord.js";
import getErrString from '../getErrString'
const paginationEmbed = require("discord.js-pagination");
import axios from 'axios';

//Formats an Array of Posts into a String that can be sent as an embedded message
const postsToString = (pArray: Post[]) => {
    return pArray.map(post => {
        return `**${post.company_name}${post.municipality_name != null ? '  ---  ' + post.municipality_name : ''}**
        [${post.heading}](https://duunitori.fi/tyopaikat/tyo/${post.slug})`
    }).join("\n\n");
}

const posts: Command = {
    name: 'posts',
    description: 'Get the original developer job postings',
    usage: 'dev posts <all>',
    arguments: ['all'],
    cooldown: 5,
    async execute(message, args) {
        if (args[0] == 'all') {
            //GET ALL DEVELOPER JOB POSTINGS

            //Send a placeholder message
            let msg = await message.channel.send("Getting the latest developer job postings from Duunitori.")

            //Asynchronous http get request from dev-job-api
            axios.get("http://dev-job-api.herokuapp.com/api/posts").then(async response => {

                let allPosts: Array<Post> = response.data.posts;
                const pages: Array<MessageEmbed> = [];
                const chunk: number = 10;

                for (let i: number = 0; i < allPosts.length; i += chunk) {
                    //Get the next 10 posts
                    let postsArr: Array<Post> = allPosts.slice(i, i + chunk);
                    //Combine info about the post objects into a string
                    let strPosts = postsToString(postsArr);
                    //Append the results into an embed
                    let embed = new MessageEmbed()
                        .setTitle(`*Duunitori developer job postings*`)
                        .setDescription(strPosts);
                    //Add the next embed page to the array
                    pages.push(embed);
                }

                msg.edit("Here they are:");

                paginationEmbed(message, pages);
                return;
            }).catch((err) => {
                console.log(err);
                return msg.channel.send("Sorry, an error occurred while getting the job postings.");
            })
        } else {
            //If the user supplies the command with invalid arguments
            return message.channel.send(getErrString(this, args))
        }
    }
}

module.exports = posts;