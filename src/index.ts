import { world, system } from "@minecraft/server";
import { DynamicDB } from "../lib/dynamic-db";
import { parseArguments } from "utils/arguments-parser";
import { Commands } from "./commands";

export const database = new DynamicDB("bedrock-identity", world);

let firstInitializationTimeout: number;

world.afterEvents.worldInitialize.subscribe(() => {
  if (!database.get("command-prefix")) database.set("command-prefix", "!");
  database.save();

  firstInitializationTimeout = system.runInterval(() => {
    if (world.getAllPlayers().length > 0) {
      for (const player of world.getAllPlayers()) initializePlayer(player);
      system.clearRun(firstInitializationTimeout);
    }
  }, 5);
});

world.afterEvents.playerJoin.subscribe((event) => {
  const player = world.getPlayers({ name: event.playerName })[0];
  if (!player) return;
  system.run(() => initializePlayer(player));
});

world.beforeEvents.chatSend.subscribe((event) => {
  const msg = event.message;
  const player = event.sender;
  if (msg.startsWith(database.get("command-prefix"))) {
    event.cancel = true;
    const cmd = msg.replace(database.get("command-prefix"), "").split(" ")[0];
    const parsedArgs = parseArguments(
      msg
        .replace(database.get("command-prefix"), "")
        .split(" ")
        .slice(1)
        .join(" "),
    );
    let command = Commands[cmd];
    const args: { [key: string]: string } = {};
    command.args.forEach((arg, i) => {
      args[arg.name] = parsedArgs[i];
    });
    system.run(() => command.callback(player, args));
    return;
  }
});

async function initializePlayer(player: server.Player) {
  player.options = new DynamicDB("bedrock-identity", player);
}
