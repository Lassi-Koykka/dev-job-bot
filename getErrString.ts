import { Command } from "./types";
//Create an error message to be displayed if the user inputs a command with invalid arguments
export default function(command: Command, args: String[]){
    const errString = 
`Invalid arguments received
**Command usage**: 
    \`${command.usage}\`
**Arguments**: 
${command.arguments.map(arg => {return `    \`${arg}\``}).join("\n")}`;
    return errString;
};