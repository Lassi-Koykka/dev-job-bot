import { Message } from "discord.js";


export interface Post {
    heading: string,
    company_name: string,
    municipality_name: string,
    slug: string,
}

export interface Technology{
    name: string,
    jobs_count: number,
    jobs: Job[]
}

export interface Job{
    heading: string,
    link: string,
    technologies: string[],
    company: string,
    location: string
}

export interface Command{
    name: string,
    description: string,
    usage: string,
    arguments: string[],
    cooldown: number,
    execute(message: Message, args: String[]): any
}


