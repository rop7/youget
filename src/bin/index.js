#!/bin/env -S node --no-warnings 

import RSp from '@rop7/rsp-libcore.js'
import shelljs from "shelljs";
import api from '../api/index.js';
import music from '../api/music.js';

const logger = new RSp.Logger();

function main() {

    new RSp.Cli('youget', {
        
        music: {
            description: "Download audio from YouTube video.",
            example: "youget music <YouTube video URL or code>",
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
            example: "youget video <YouTube video URL or code>",
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