import { config } from "dotenv";
import { Client, CommandInteraction, AutocompleteInteraction, type BitFieldResolvable, type IntentsString, type PartialTypes, MessageFlags } from "discord.js";
import { glob } from "glob";
config();


export class SystemicalBot {
  CLIENT: Client;
  commands: Array<command>;
  constructor(token: string | undefined, options: {
    intents: BitFieldResolvable<IntentsString, number>,
    partials: PartialTypes[]
  }) {
    if (!token) process.exit();
    this.CLIENT = new Client({
      intents: options.intents,
      partials: options.partials
    });

    this.commands = [];
    this.#handleEvents();
    this.CLIENT.login(token);
  }

  async #handleEvents() {
    const EVENTS = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/Discord/events/**/*.js`);

    if (!EVENTS) process.exit();

    for (let i = 0; i < EVENTS.length; i++) {
      if (typeof EVENTS[i] === "undefined") return;
      
      //? I LITERALLY *AM* CHECKING IF ITS UNDEFINED.
      //? WHY THE FUCK AM I GETTING AN ERROR THAT IT CAN BE "UNDEFINED"
      const EVENT: event = require(EVENTS[i] as string).default;

      // Attach the listener, passing the SystemicalBot instance and event args to the handler function.
      this.CLIENT.on(EVENT.event, (...args) => {
        EVENT.function(this, args);
      });

    }
  }
}

export type event = {
  event: string,
  function: (APOLLYON: SystemicalBot, args: Array<any>) => Promise<any>
}


export type command = {
  interaction: {
    type?: 1 | 2 | 3;
    name: string;
    name_localizations?: { [id: string]: string };
    description: string;
    description_localizations?: {};
    options?: Array<commandOption>;
    default_member_permissions?: string;
    default_permission?: boolean;
  };
  flags: MessageFlags;
  run: (SystemicalBot: SystemicalBot, interaction: CommandInteraction) => Promise<any>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>;
}

export type commandOption = {
  type: number;
  name: string;
  name_localizations?: { [id: string]: string };
  description: string;
  description_localizations?: { [id: string]: string };
  required?: boolean;
  choices?: Array<{
    name: string;
    name_localizations?: { [id: string]: string };

    value: number | string;
  }>;
  options?: Array<commandOption>;
  channel_type?: { [id: string]: string };
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  autocomplete?: boolean;
}


export type guild = {
  logChannelID?: string
}

export type user = {
  ai_character?: string
}


export const commandOptionTypes = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTATCHMENTS: 11
}


new SystemicalBot(process.env["BOT_TOKEN"], {
  intents: ["GUILDS", "MESSAGE_CONTENT", "GUILD_WEBHOOKS"],
  partials: ["MESSAGE", "CHANNEL"]
}); //? For now I dont have the thing defined
