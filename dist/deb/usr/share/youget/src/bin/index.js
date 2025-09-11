#!/bin/env -S node --no-warnings 
 
import shelljs from "shelljs";

const home = process.env.HOME;
const musicDir = home + "/Space/Music";

function main () {
        
    const args = process.argv[2] || process.argv[3];

    // console.log("Args:", args);

    if (!args) {
        console.error("Please Youtube video URL or code.");
        process.exit(1);
    }

    const ytUrlOrCode = args;

    if (!shelljs.which("yt-dlp")) {
        console.error("Error: yt-dlp is not installed.");
        process.exit(1);
    }

    console.log("\n  ~ Starting YouTube video download.");
    console.log("  ~ YouTube video URL/code:", ytUrlOrCode);

    const tempDir = `/tmp/youget/${ytUrlOrCode.replace(/[^a-zA-Z0-9]/g, "_")}/`;

    shelljs.exec(`mkdir -p ${tempDir}`);
    
    const downloadProcess = shelljs.exec(`cd ${tempDir} && /usr/bin/yt-dlp -x --audio-format mp3 --audio-quality 0 ` + ytUrlOrCode + ` && ls ${tempDir}`, { silent: true });

    if (downloadProcess.code !== 0) {
        
        console.error("     - Fail downloading video: \n")
        console.error("    ", downloadProcess.stderr);
        
        shelljs.exec(`rm -rf ${tempDir}`);

        return;
    }

    console.log("  ~ Downloaded video: " + ytUrlOrCode);

    const downloadedFiles = shelljs.ls(tempDir + "*.mp3");

    if (downloadedFiles.length === 0) {
        console.error("No audio files were downloaded for video: " + ytUrlOrCode);
        return;
    }

    downloadedFiles.forEach(filePath => {

        const fileName = filePath.split("/").pop();
        const trackFriendlyName = fileName.replace(/[^a-zA-Z0-9]/g, "_").replace('mp3', '');
        const newFilePath = musicDir + "/" + trackFriendlyName;

        shelljs.exec(`mkdir -p "${musicDir}"`);
        shelljs.exec(`mv "${filePath}" "${newFilePath}.mp3"`);

        console.log("  ~ Moved file to: " + newFilePath + ".mp3");

        shelljs.exec(`rm -rf ${tempDir}`);

        console.log("  ~ Finished processing video: " + ytUrlOrCode);
        console.log("  ~ Playing downloaded tracks...");

        shelljs.exec(`cd "${musicDir}" && open ${newFilePath}.mp3`, { async: false });

        process.exit(0);
        
    });

}

main();