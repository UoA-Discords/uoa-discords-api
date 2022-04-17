import { existsSync, readdirSync, rmSync } from 'fs';

function recursiveNameGet(parentPath: string): string[] {
    const items = readdirSync(parentPath);
    const folders = items.filter((e) => !e.includes('.'));
    const files = items.filter((e) => e.endsWith('.log')).map((e) => `${parentPath}/${e}`);

    for (const folder of folders) {
        const folderItems = recursiveNameGet(`${parentPath}/${folder}`);
        files.push(...folderItems);
    }

    return files;
}

if (existsSync('logs')) {
    const logFiles = recursiveNameGet('logs');
    console.log(`Deleting ${logFiles.length} logs`);
    logFiles.forEach((e) => rmSync(e));
} else {
    console.log('No logs found');
}
