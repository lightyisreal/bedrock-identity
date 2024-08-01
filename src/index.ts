import * as server from "@minecraft/server";
import { DynamicDB } from "../lib/dynamic-db";
import { parseArguments } from "utils/arguments-parser";
import { Commands } from "./commands";

export const database = new DynamicDB("bedrock-identity", server.world);

let firstInitializationTimeout: number;

server.world.afterEvents.worldInitialize.subscribe(() => {
  if (!database.get("command-prefix")) database.set("command-prefix", "!");
  database.save();

  firstInitializationTimeout = server.system.runInterval(() => {
    if (server.world.getAllPlayers().length > 0) {
      for (const player of server.world.getAllPlayers())
        initializePlayer(player);
      server.system.clearRun(firstInitializationTimeout);
    }
  }, 5);
});

server.world.afterEvents.playerJoin.subscribe((event) => {
  const player = server.world.getPlayers({ name: event.playerName })[0];
  if (!player) return;
  server.system.run(() => initializePlayer(player));
});

server.world.beforeEvents.chatSend.subscribe((event) => {
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
    server.system.run(() => command.callback(player, args));
    return;
  }
});

async function initializePlayer(player: server.Player) {
  player.sendMessage("Hi!");
}
