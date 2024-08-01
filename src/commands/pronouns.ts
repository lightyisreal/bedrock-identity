import { CommandBuilder } from "../structures/command";

export const PronounsCommand = new CommandBuilder()
  .setDescription("Set your pronouns using your pronouns.page username.")
  .setArguments({
    name: "pronouns",
    required: true,
  })
  .setCallback(async (player, args) => {})
  .build();
