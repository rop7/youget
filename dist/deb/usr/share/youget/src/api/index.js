import RSp from '@rop7/rsp-libcore.js'
import music from './music.js';
import video from './video.js';

const logger = new RSp.Logger();

export { logger };

export default {
    music,
    video
}