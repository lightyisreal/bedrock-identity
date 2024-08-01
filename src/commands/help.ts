import { Commands } from ".";
import { database } from "../index";
import { CommandBuilder } from "../structures/command";

export const HelpCommand = new CommandBuilder()
  .setDescription(
    "Shows the command list or information about a specific command.",
  )
  .setArguments({
    name: "command",
    required: false,
  })
  .setCallback(async (player, args) => {
    if (args.command) {
      const command = Commands[args.command];
      if (command) {
        const cmdArgs = command.args.map(
          (arg) =>
            `${arg.required ? "<" : "["}${arg.name}${arg.required ? ">" : "]"}`,
        );
        const message = `§e${args.command}§r:\n${command.description}\nUsage: ${database.get("command-prefix")}${args.command} ${cmdArgs.join(" ")}`;
        return player.sendMessage(message);
      }
      return player.sendMessage("§cUnknown command!");
    }
    const message = Object.keys(Commands)
      .map((cmd) => `§e${cmd}§r: ${Commands[cmd].description}`)
      .join("\n");
    player.sendMessage("§eCommands:\n" + message);
  })
  .build();
