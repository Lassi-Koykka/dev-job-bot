import Discord, { Channel } from "discord.js";
import axios from "axios";

import Post from "./post"

const client = new Discord.Client();

import { prefix, token } from '../config.json';
import { parseJsonText } from "typescript";

client.once('ready', () => {
    console.log('Ready!')
})

client.login(token);


client.on('message', async message =>{

    if (!message.content.startsWith(prefix) 
    || message.author.bot 
    || message.channel.type != 'text') return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if(command == 'posts'){
        if(!args.length){
            message.channel.send("You need to provide arguments to get results dumbass.");
        } else if(args[0] == 'top'){
            let msg = await message.channel.send("Getting 10 latest developer job postings on Duunitori.")
            axios.get("http://dev-job-api.herokuapp.com/api/posts").then(response => {
                const topPosts: Array<Post> = response.data.posts.slice(0, 10);
                const strTopPosts = topPosts.map(post =>{
                    return `**${post.company_name}**\n[${post.heading}](https://duunitori.fi/tyopaikat/tyo${post.slug})`
                }).join("\n\n");
                const embed = new Discord.MessageEmbed().setTitle("Latest developer job postings on Duunitori").setDescription(strTopPosts)

                msg.delete();
                message.channel.send(embed)
            }).catch(error => {
                console.log(error)
            })
            
        }
    }


    
    
})

