import shelljs from "shelljs";
import { logger } from './index.js';

export default function (ytUrlOrCode = ( process.argv[2] || process.argv[3])) {

    const home = process.env.HOME;
    const VideoDir = home + "/Space/Video";
    
    // logger.debug({ ytUrlOrCode });

    if (!ytUrlOrCode) {
        logger.error("Please Youtube Video URL or code.");
        process.exit(1);
    }

    if (!shelljs.which("yt-dlp")) {
        logger.error("Error: yt-dlp is not installed.");
        process.exit(1);
    }

    logger.subhead("Starting YouTube Video download.");
    logger.info("YouTube Video URL/code: " + ytUrlOrCode);

    const tempDir = `/tmp/youget/${ytUrlOrCode.replace(/[^a-zA-Z0-9]/g, "_")}/`;

    shelljs.exec(`mkdir -p ${tempDir}`);
    
    const downloadProcess = shelljs.exec(`cd ${tempDir} && /usr/bin/yt-dlp -t mp4 ` + ytUrlOrCode + ` && ls ${tempDir}`, { silent: true });

    if (downloadProcess.code !== 0) {
        
        logger.error("Fail downloading Video:")
        logger.error(downloadProcess.stderr);
        
        shelljs.exec(`rm -rf ${tempDir}`);

        return;
    }

    logger.success("Downloaded Video: " + ytUrlOrCode);

    const downloadedFiles = shelljs.ls(tempDir + "*.mp4");

    if (downloadedFiles.length === 0) {
        logger.error("No audio files were downloaded for Video: " + ytUrlOrCode);
        return;
    }

    downloadedFiles.forEach(filePath => {

        const fileName = filePath.split("/").pop();
        const trackFriendlyName = fileName.replace(/[^a-zA-Z0-9]/g, "_").replace('mp4', '');
        const newFilePath = VideoDir + "/" + trackFriendlyName;

        shelljs.exec(`mkdir -p "${VideoDir}"`);
        shelljs.exec(`mv "${filePath}" "${newFilePath}.mp4"`);

        logger.info("Moved file to: " + newFilePath + ".mp4");

        shelljs.exec(`rm -rf ${tempDir}`);

        logger.success("Finished processing Video: " + ytUrlOrCode);
        logger.loading("Playing downloaded tracks...");

        shelljs.exec(`cd "${VideoDir}" && open ${newFilePath}.mp4`, { async: false });

        process.exit(0);
        
    });

}
