import { SystemicalBot, type event } from "../index.js";

const interactionCreate: event = {
    event: "interactionCreate",
    function: async (SYSTEMICAL_BOT: SystemicalBot, args: Array<any>) => {
        const interaction = args[0];

        if (interaction.isAutocomplete()) {
            return;
        }

        if (interaction.isChatInputCommand()) {
            for (let i = 0; i < SYSTEMICAL_BOT.commands.length; i++) {
                try {
                    await interaction.deferReply({ flags: SYSTEMICAL_BOT.commands[i]?.flags });
                    return await SYSTEMICAL_BOT.commands[i]?.run(SYSTEMICAL_BOT, interaction);
                } catch (err) {
                    if (err instanceof Error) {
                        console.log(err);
                    }
                }
            }
        }
    }
}


export default interactionCreate;