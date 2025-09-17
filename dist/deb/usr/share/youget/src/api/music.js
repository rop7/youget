import shelljs from "shelljs";
import { logger } from './index.js';

export default function (ytUrlOrCode = ( process.argv[2] || process.argv[3])) {

    const home = process.env.HOME;
    const musicDir = home + "/Space/Music";
    
    // logger.debug({ ytUrlOrCode });

    if (!ytUrlOrCode) {
        logger.error("Please Youtube Music URL or code.");
        process.exit(1);
    }

    if (!shelljs.which("yt-dlp")) {
        logger.error("Error: yt-dlp is not installed.");
        process.exit(1);
    }

    logger.subhead("Starting YouTube Music download.");
    logger.info("YouTube Music URL/code: " + ytUrlOrCode);

    const tempDir = `/tmp/youget/${ytUrlOrCode.replace(/[^a-zA-Z0-9]/g, "_")}/`;

    shelljs.exec(`mkdir -p ${tempDir}`);
    
    const downloadProcess = shelljs.exec(`cd ${tempDir} && /usr/bin/yt-dlp -x --audio-format mp3 --audio-quality 0 ` + ytUrlOrCode + ` && ls ${tempDir}`, { silent: true });

    if (downloadProcess.code !== 0) {
        
        logger.error("Fail downloading Music:")
        logger.error(downloadProcess.stderr);
        
        shelljs.exec(`rm -rf ${tempDir}`);

        return;
    }

    logger.success("Downloaded Music: " + ytUrlOrCode);

    const downloadedFiles = shelljs.ls(tempDir + "*.mp3");

    if (downloadedFiles.length === 0) {
        logger.error("No audio files were downloaded for Music: " + ytUrlOrCode);
        return;
    }

    downloadedFiles.forEach(filePath => {

        const fileName = filePath.split("/").pop();
        const trackFriendlyName = fileName.replace(/[^a-zA-Z0-9]/g, "_").replace('mp3', '');
        const newFilePath = musicDir + "/" + trackFriendlyName;

        shelljs.exec(`mkdir -p "${musicDir}"`);
        shelljs.exec(`mv "${filePath}" "${newFilePath}.mp3"`);

        logger.info("Moved file to: " + newFilePath + ".mp3");

        shelljs.exec(`rm -rf ${tempDir}`);

        logger.success("Finished processing Music: " + ytUrlOrCode);
        logger.loading("Playing downloaded tracks...");

        shelljs.exec(`cd "${musicDir}" && open ${newFilePath}.mp3`, { async: false });

        process.exit(0);
        
    });

}
