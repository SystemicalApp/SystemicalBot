import { glob } from "glob";
import { command, SystemicalBot, type event } from "../index.js";

const clientReady: event = {
    event: "clientReady",

    function: async (SYSTEMICAL_BOT: SystemicalBot, _args: Array<any>) => {
        SYSTEMICAL_BOT.CLIENT.user?.setActivity({ name: "In early development, expect bugs!" });

        const FILES = await glob(`${process.cwd().replaceAll("\\","/")}/dist/commands/**/*.js`);

        for (let i = 0; i < FILES.length; i++) {
            const path = FILES[i];
            if (path === undefined) continue;

            const COMMAND: command = require(path).default;

            if(!COMMAND.interaction.name) continue;

            SYSTEMICAL_BOT.commands.push(COMMAND);

            if(SYSTEMICAL_BOT.CLIENT.isReady()) {
                SYSTEMICAL_BOT.CLIENT.application?.commands.create(COMMAND.interaction);
            }
        }


        console.log(`${SYSTEMICAL_BOT.CLIENT.user?.username} is ready!`);
        console.log(`Logged in as ${SYSTEMICAL_BOT.CLIENT.user?.username}#${SYSTEMICAL_BOT.CLIENT.user?.discriminator}`);
        console.log(`ID: ${SYSTEMICAL_BOT.CLIENT.user?.id}`);
        console.log(`Guilds: ${SYSTEMICAL_BOT.CLIENT.guilds.cache.size}`);
        console.log(`Users: ${SYSTEMICAL_BOT.CLIENT.users.cache.size}`);
        console.log(`Channels: ${SYSTEMICAL_BOT.CLIENT.channels.cache.size}`);
        console.log(`Emotes: ${SYSTEMICAL_BOT.CLIENT.emojis.cache.size}`);
    }
};

export default clientReady;
