//? Creating a command to create a journal entry. In the future, this will be a subcommand of a larger command.

// TODO: Add user option to make the journal entry non-ephemeral.

import { Attachment, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { command, commandOptionTypes, SystemicalBot } from "../../index.js";


const CREATE_JOURNAL: command = {
    interaction: {
        name: "create_journal",
        description: "Creates a new journal entry.",
        options: [
            {
                name: "title",
                description: "The title of the journal entry",
                type: commandOptionTypes.STRING,
                required: true,
            },
            {
                name: "content",
                description: "The content of the journal entry",
                type: commandOptionTypes.STRING,
                required: true,
            },
            {
                name: "date",
                description: "The date of the journal entry. Defaults to today's date. (Format: MM/DD/YYYY)",
                type: commandOptionTypes.STRING,
                required: false,
            },
            {
                //? Some people, like myself, draw in the journal entries. This is an optional field if the user wants to add the thumbnail.
                name: "thumbnail_attachment",
                description: "The thumbnail of the journal entry",
                type: commandOptionTypes.ATTATCHMENTS,
                required: false,
            }, {
                //? Just in case the user wants to add the thumbnail via a URL. Saves on having to upload the file to the server as well.
                name: "thumbnail_url",
                description: "The URL of the thumbnail of the journal entry. If an attachment is provided, this will be ignored.",
                type: commandOptionTypes.STRING,
                required: false,
            }
        ],
    },
    flags: MessageFlags.Ephemeral,
    run: async (_SYSTEMICAL_BOT: SystemicalBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        const TITLE: string = interaction.options.getString("title", true);
        const CONTENT: string = interaction.options.getString("content", true);
        const DATE: string = interaction.options.getString("date", false) ?? new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
        const THUMBNAIL: Attachment | null = interaction.options.getAttachment("thumbnail_attachment", false);
        const THUMBNAIL_URL: string | null = interaction.options.getString("thumbnail_url", false);
        //? Just give some leeway for the date format. 
        //? Accept 3/25/2026 and 03/25/2026 for example.
        if (DATE.length !== 10 && DATE.length !== 9) {
            await interaction.editReply({ content: "Invalid date format. Please use the format MM/DD/YYYY." });
            return;
        }

        const [MONTH, DAY, YEAR] = DATE.split("/");
        if (isNaN(Number(MONTH)) || isNaN(Number(DAY)) || isNaN(Number(YEAR))) {
            await interaction.editReply({ content: "Invalid date. Please use a valid date. (Format: MM/DD/YYYY)" });
            return;
        }

        if (Number(MONTH) > 12 || Number(DAY) > 31 || Number(YEAR) > new Date().getFullYear()) {
            await interaction.editReply({ content: "Invalid date. Please use a valid date." });
            return;
        }


        //? Once the main section of the app is built; or at the very least alter-registering is complete; we need to change this to be under the current alter's journal.

        //? Just test creating a journal entry embed.

        //? Actually, we need to make sure the text in the embed is not too long, and if it is, we need to split it into multiple embeds.
        //? I do not want to force people to reduce the size of the text, so we need to split it into multiple embeds.

        if (CONTENT.length + TITLE.length + DATE.length >= 4096) {
            const embeds: EmbedBuilder[] = [];

            //? Dont add the thumbnail to subsequent embeds.
            //? Don't add the title to subsequent embeds.
            //? Only add the date to the last embed.
            for (let i = 0; i < CONTENT.length; i += 4080) {
                if (i === 0) {
                    embeds.push(new EmbedBuilder()
                        .setTitle(TITLE)
                        .setDescription(CONTENT.slice(i, i + 4080 - TITLE.length - DATE.length))
                        .setFooter({ text: `Journal date: ${DATE}` })
                        //? Technically, the final ?? null is redundant since both are nullable.
                        //? Prefer uploaded attachments over URLs.
                        .setImage(THUMBNAIL?.url ?? THUMBNAIL_URL ?? null));

                        i -= TITLE.length + DATE.length;
                }
                else if (i + 4096 < CONTENT.length) {
                    embeds.push(new EmbedBuilder()
                        .setDescription(CONTENT.slice(i, i + 4080))); //? 4090 to be safe.
                } else {
                    embeds.push(new EmbedBuilder()
                        .setDescription(CONTENT.slice(i, CONTENT.length - 1))
                        .setFooter({ text: `Journal date: ${DATE}` }));
                }
            }

            await interaction.editReply({content: "Journal entry created successfully.", embeds: embeds });

            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(TITLE)
            .setDescription(CONTENT)
            .setFooter({ text: `Journal date: ${DATE}` })
            //? Technically, the final ?? null is redundant since both are nullable.
            //? Prefer uploaded attachments over URLs.
            //? Prefer images over thumbnails.
            .setImage(THUMBNAIL?.url ?? THUMBNAIL_URL ?? null);

        await interaction.editReply({ embeds: [embed] });

        return;
    },
};

export default CREATE_JOURNAL;
