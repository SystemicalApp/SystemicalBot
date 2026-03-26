import { config } from "dotenv";
import {
  Client,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GatewayIntentBits,
  Partials,
  MessageFlags,
  type ApplicationCommandOptionData,
  type BitFieldResolvable,
  type ChatInputApplicationCommandData,
  type GatewayIntentsString,
} from "discord.js";
import { glob } from "glob";
config();


export class SystemicalBot {
  CLIENT: Client;
  commands: Array<command>;
  constructor(token: string | undefined, options: {
    intents: BitFieldResolvable<GatewayIntentsString, number>,
    partials: Partials[]
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
    const EVENTS = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/events/**/*.js`);

    if (!EVENTS) process.exit();

    for (let i = 0; i < EVENTS.length; i++) {
      const path = EVENTS[i];
      if (path === undefined) continue;

      const EVENT: event = require(path).default;

      // Attach the listener, passing the SystemicalBot instance and event args to the handler function.
      this.CLIENT.on(EVENT.event, (...args) => {
        EVENT.function(this, args);
      });

    }
  }
}

export type event = {
  event: string,
  function: (SYSTEMICAL_BOT: SystemicalBot, args: Array<any>) => Promise<any>
}


export type command = {
  interaction: ChatInputApplicationCommandData;
  flags: MessageFlags;
  run: (SystemicalBot: SystemicalBot, interaction: ChatInputCommandInteraction) => Promise<any>;
  //? Update this to support message commands soon.
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>;
}

export type commandOption = ApplicationCommandOptionData;


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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildWebhooks,
  ],
  partials: [Partials.Message, Partials.Channel],
}); //? For now I dont have the thing defined
