import { Player } from "@minecraft/server";

/**
 * @description A utility to create commands
 * @author Lighty
 * @version 1.0.0
 */
export class CommandBuilder {

    /**
     * @description The description of the command, shown in the help command
     */
    private description: string;
    /**
     * @description All the arguments of the command
     */
    private args: CommandArgument[];
    /**
     * @description The execution part of the command
     */
    private callback: CommandCallback;

    constructor() {
        this.description = 'No description provided.';
        this.args = [];
        this.callback = async (player, _args) => {
            player.sendMessage('§cUnknown command!');
        };
    }

    /**
     * @description Sets the description of the command
     * @param description The description of the command
     * @returns {CommandBuilder}
     */
    public setDescription(description: string): CommandBuilder {
        this.description = description;
        return this;
    }

    /**
     * @description Sets the command's arguments
     * @param args All the arguments of the command
     * @returns {CommandBuilder}
     */
    public setArguments(...args: CommandArgument[]): CommandBuilder {
        this.args = args.sort((a, b) => Number(b.required) - Number(a.required));
        // Put optional arguments as last
        return this;
    }

    /**
     * @description Sets the code that will be executed after typing the command
     * @param callback The callback function of the command
     * @returns {CommandBuilder}
     */
    public setCallback(callback: CommandCallback): CommandBuilder {
        this.callback = callback;
        return this;
    }

    /**
     * @description Builds the command into an object
     * @returns {Command}
     */
    public build(): Command {
        return {
            description: this.description,
            args: this.args,
            callback: this.callback
        };
    }

}

export type Command = {
    description: string;
    args: CommandArgument[];
    callback: CommandCallback;
};

export type CommandCallback = (player: Player, args: { [key: string]: string | undefined; }) => Promise<void>;

export type CommandArgument = {
    name: string;
    required: boolean;
};