import { MinecraftServer } from './websocket';
import * as os from 'os';
import * as path from 'path';
import * as chokidar from 'chokidar';
import * as fs from 'fs';
import config from './config.json';

const socket = new MinecraftServer(8080);

function minecraftPath() {
    if (config.useBDS) {
        return path.join(process.cwd(), 'bds');
    }
    if (process.platform === 'win32') {
        let actualPath = path.join(os.homedir(), '/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/');
        if (config.usePreview)
            actualPath = path.join(os.homedir(), '/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang/');
        // console.log(actualPath);
        return actualPath;
    }
    if (process.platform === 'linux') {
        return os.homedir() + '/.var/app/io.mrarm.mcpelauncher/data/mcpelauncher/games/com.mojang/';
    }
    throw new Error("This script only supports Windows and Linux (flatpak) Minecraft Bedrock Edition installations.");
}

let build = async () => {
    let build = await Bun.build({
        entrypoints: ["src/index.ts"],
        external: ["@minecraft"],
        outdir: path.join(minecraftPath(), `/development_behavior_packs/${config.addonIdentifier}/scripts`),
        sourcemap: "external"
    });
    if (!build.success) {
        console.error("Build failed. Error(s):");
        console.error(build.logs.filter(log => log.level === "error").map(log => `- ${log.position ? `${log.position.file.replace(path.join(process.cwd(), '/'), '')}:${log.position.line}:${log.position.column} -> ${log.message}` : log.message}`).join("\n"));
    }
};

async function copyFolder(name: string, dest: string) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    } else {
        fs.rmSync(dest, { recursive: true });
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(name);

    for (const file of files) {
        const curPath = path.join(name, file);
        const destPath = path.join(dest, file);

        const stats = fs.statSync(curPath);

        if (stats.isDirectory()) {
            await copyFolder(curPath, destPath);
        } else {
            fs.copyFileSync(curPath, destPath);
        }
    }
}

async function reloadClients() {
    for (const client of socket.clients) {
        const { status, message } = await client.sendCommand("reload");
        if (status === 0) {
            return;
        }
        client.sendMessage(
            `Reload failed.\nError: ${message}`
        );
    }
}

await copyFolder("behavior_pack", minecraftPath() + "/development_behavior_packs/" + config.addonIdentifier);
await copyFolder("resource_pack", minecraftPath() + "/development_resource_packs/" + config.addonIdentifier);
await build();

chokidar.watch('behavior_pack/functions').on('change' || 'add', async () => {
    await copyFolder("behavior_pack/functions", minecraftPath() + "/development_behavior_packs/" + config.addonIdentifier + "/functions");
    await reloadClients();
});

chokidar.watch(['src', 'lib']).on('change' || 'add', async () => {
    await build();
    await reloadClients();
});

console.log(`Watching for script changes...`);
console.log(`For automatic reloading, run the following command: "/wsserver ws://localhost:8080"`);

process.on('SIGINT', async () => {
    console.log('Exiting...');
    socket.dispose();
    process.exit();
});