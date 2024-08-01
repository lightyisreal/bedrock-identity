import { Command } from "../structures/command";
import { HelpCommand } from "./help";
import { PronounsCommand } from "./pronouns";

export const Commands: { [key: string]: Command } = {
  help: HelpCommand,
  pronouns: PronounsCommand,
};
