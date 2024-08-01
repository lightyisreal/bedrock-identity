import { DynamicDB } from "dynamic-db";}

export {};

declare module "@minecraft/server" {
  interface Player {
    options: DynamicDB;
  }
}
