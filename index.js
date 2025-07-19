import 'dotenv/config';
import { Client } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { GatewayIntentBits, Partials } from 'discord.js';

import OxyBotFeature from './src/feature.js';
import { Sleep } from './src/functions.js';

/**
 * @typedef {import('./src/feature.js').default} OxyBotFeature
 * @typedef {import('discord.js').Message} Message
 * @typedef {import('discord.js').Interaction} Interaction
 * 
 * @typedef {import('discord.js').ClientOptions} ClientOptions
 * @typedef {import('discord.js').Awaitable<void>} DiscordAwaitable
 */

const DEFAULT_DISCORD_OPTIONS = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel
    ]
};

class OxyBot {
    /**
     * @private
     * @type {string}
     */
    token = process.env.DISCORD_TOKEN;

    /**
     * @private
     * @type {Array<OxyBotFeature>}
     */
    classes = [];

    /**
     * @param {string} [token] Default set to process.env.DISCORD_TOKEN
     * @param {ClientOptions} [options] Default set to DEFAULT_DISCORD_OPTIONS
     */
    constructor(token = null, options = null) {
        if (token !== null) {
            this.token = token;
        }

        this.client = new Client(options || DEFAULT_DISCORD_OPTIONS);
        this.client.on('ready', this.onReady.bind(this));
        this.client.on('messageCreate', this.onMessage.bind(this));
        this.client.on('interactionCreate', this.onInteraction.bind(this));
    }

    /** @param {Array<OxyBotFeature>} classes */
    Start(classes = []) {
        this.classes = classes;
        this.classes.forEach(classs => classs.bot = this);
        this.client.login(this.token);
        process.addListener('SIGINT', this.destructor.bind(this));
    }

    /**
     * @private
     */
    async destructor() {
        console.log('\nExiting...');
        process.removeAllListeners('SIGINT');

        for (let i = 0; i < this.classes.length; i++) {
            await this.classes[i].onClose();
        }

        this.client.destroy();
        await Sleep(1000);
        process.exit(0);
    }

    /**
     * @private
     * @description Event called when the bot is ready.
     * @param {Client} client
     * @returns {DiscordAwaitable}
     */
    onReady(client) {
        console.log(`Logged in as ${this.client.user.tag}!`);

        this.InitSlashCommands();
        for (let i = 0; i < this.classes.length; i++) {
            this.classes[i].onReady();
        }
    }

    /**
     * @private
     * @description Event called when a message is received.
     * @param {Message} message
     * @returns {DiscordAwaitable}
     */
    onMessage(message) {
        for (let i = 0; i < this.classes.length; i++) {
            this.classes[i].parseMessage(message);
        }
    }

    /**
     * @private
     * @description Event called when a interaction is received.
     * @param {Interaction} interaction
     * @returns {DiscordAwaitable}
     */
    onInteraction(interaction) {
        for (let i = 0; i < this.classes.length; i++) {
            this.classes[i].parseInteraction(interaction);
        }
    }

    async InitSlashCommands() {
        const rest = new REST({ version: '10' }).setToken(this.token);
        try {
            const commands = [];
            for (let i = 0; i < this.classes.length; i++) {
                const classe = this.classes[i];
                const slashCommands = await classe.DefineSlashCommands();
                commands.push(...slashCommands);
            }

            await rest.put(
                Routes.applicationCommands(this.client.user.id),
                { body: commands },
            );

            console.log('SlashCommands saved');
        } catch (error) {
            console.error(error);
        }
    };
}

export { OxyBotFeature };
export default OxyBot;
