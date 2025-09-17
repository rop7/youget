#!/bin/env -S node --no-warnings 

import RSp from '@rop7/rsp-libcore.js'
import api from '../api/index.js';

const logger = new RSp.Logger();

function main() {

    new RSp.Cli('youget', {
        
        music: {
            description: "Download audio from YouTube video.",
            example: "youget music <YouTube_URL_OR_CODE>",
            execute () {

                const ytUrlOrCode = process.argv[3];

                if (!ytUrlOrCode) {
                    logger.error("Please provide a YouTube video URL or code.");
                    process.exit(1);
                }

                api.music(ytUrlOrCode);
            }
        },

        video: {
            description: "Download video from YouTube video.",
            example: "youget video <YouTube_URL_OR_CODE>",
            execute () {

                const ytUrlOrCode = process.argv[3];

                if (!ytUrlOrCode) {
                    logger.error("Please provide a YouTube video URL or code.");
                    process.exit(1);
                }

                api.video(ytUrlOrCode);
            }
        }
    })

}

main();