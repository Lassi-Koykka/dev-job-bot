import { Command, Technology, Job } from '../types';
import getErrString from '../getErrString'
import { MessageEmbed } from "discord.js";
const paginationEmbed = require("discord.js-pagination");
import axios from 'axios';

const tech: Command = {
    name: "tech",
    description: "",
    usage: "dev tech <arguments>",
    arguments: ['top', 'jobs [tech name]', 'list'],
    cooldown: 0,
    async execute(message, args) {
        if (args[0] == 'top') {
            //GET MOST FREQUENTLY MENTIONED TECHNOLOGIES IN DESCENDING ORDER

            //Placeholder message which can be referenced later for editing
            let msg = await message.channel.send("Getting technologies most frequently mentioned in developer job postings...")

            axios.get("http://dev-job-api.herokuapp.com/api/data/technologies").then(async response => {
                //Read all the technology objects into a list 
                const techList: Array<Technology> = Object.values(response.data);
                //Sort the technologies by the number of jobs they are mentioned in. (descending)
                techList.sort((a, b) => (a.jobs_count < b.jobs_count) ? 1 : -1);

                const pages: Array<MessageEmbed> = [];
                const chunk: number = 18;

                for (let i: number = 0; i < techList.length; i += chunk) {
                    //Get the next 10 technologies
                    let techArr: Array<Technology> = techList.slice(i, i + chunk);

                    //Append the results into an embed
                    let embed = new MessageEmbed()
                        .setTitle(`*Technologies most frequently mentioned in job postings*`)
                        .setColor("#9808d1")
                        .setDescription("To get all job postings mentioning a specific technology use the command:\n```dev tech jobs [name]```");


                    //Adds inline fields for listing technologies and their occurrences
                    embed.addFields(techArr.map(t => {
                        return { name: t.name, value: `${t.jobs_count} JOBS`, inline: true }
                    }));

                    //Add the next embed page to the array
                    pages.push(embed);
                }
                msg.edit('Here they are:');

                paginationEmbed(message, pages);
                return;

            }).catch(err => {
                console.log(err.response);
                return msg.channel.send("Sorry, an error occurred while returning data from the API.")
            })
        } else if (args[0] == 'jobs') {
            if (args[1]) {
                //Join the arguments to form the name of the technology
                const techName = args.slice(1).join("-").toLowerCase();
                //Placeholder message which can be referenced later for editing
                let msg = await message.channel.send(`Getting job postings for ${techName}`)

                axios.get(`http://dev-job-api.herokuapp.com/api/data/technologies/${techName}`)
                    .then(async response => {
                        //Response Technology object
                        const t: Technology = response.data
                        const techJobsList = t.jobs;
                        const pages: Array<MessageEmbed> = [];

                        //Crete a set of all job locations and distribute the jobs to their correct locations 
                        //inside the locations field.
                        let locations: Array<{locationName: string, jobs: Array<Job>}> = [];
                        [...new Set(techJobsList.map(j => j.location))]
                            .forEach(location => { 
                                locations.push({
                                    locationName: location, 
                                    jobs: techJobsList.filter(j => { return j.location == location })
                                }) 
                            });

                        locations.forEach(l =>{
                            //Create a string for the jobs field
                            let strLocationTechJobs = l.jobs.map(j => {
                                return `**${j.company}**\n` +`[${j.heading}](${j.link})`
                            }).join("\n")


                            if(strLocationTechJobs.length <= 2048){         
                                let embed = new MessageEmbed()
                                .setTitle(`**${techName.toUpperCase()} JOBS ---- ${l.locationName.toUpperCase()}**`)
                                .setDescription(strLocationTechJobs);
                                pages.push(embed);

                            } else {

                                //An array for splitting locations jobs on multiple pages
                                let jobStrings: Array<string> = [];
                                //Split after last job link before exceeding max message length
                                let end = strLocationTechJobs.lastIndexOf(')\n', 2048)+1;
                                let strJobs = strLocationTechJobs.slice(0, end);
                                let strRest = strLocationTechJobs.slice(end);
                                jobStrings.push(strJobs);
                                
                                while(strRest.length > 2048){
                                    end = strRest.lastIndexOf(')\n', 2048)+1;
                                    strJobs = strRest.slice(0, end);
                                    strRest = strRest.slice(end);
                                    //Push the substring to array
                                    jobStrings.push(strJobs);
                                }
                                //Push the remaining string
                                jobStrings.push(strRest);
                                
                                jobStrings.forEach(s => {
                                    let embed = new MessageEmbed()
                                    .setTitle(`**${techName.toUpperCase()} JOBS ---- ${l.locationName.toUpperCase()}**`)
                                    .setDescription(s)

                                    pages.push(embed)
                                })
                            }
                        })
                        paginationEmbed(message, pages);
                    }).catch(err => {

                        console.log(err.response);
                        if (err.response.status == 404) {
                            return msg.edit(`No data found for **${techName}**.\nMake sure you wrote the name of the technology correctly.\n` +
                                "To list all technologies with data, run the command:\n" +
                                "`dev tech list`")
                        } else {
                            return msg.edit("Sorry, an error occurred while returning data from the API.")
                        }
                    })

            } else {
                return message.channel.send(getErrString(this, args));
            }
        } else {

            //If the user supplies the command with invalid argument
            return message.channel.send(getErrString(this, args));

        }

    }
}
module.exports = tech;