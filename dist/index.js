import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { GatewayIntentBits, Partials, Client } from 'discord.js';
import OxyBotFeature from './src/feature.js';
import { Sleep } from './src/utils.js';
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
    token = process.env.DISCORD_TOKEN || null;
    classes = [];
    client;
    /**
     * @param token Default set to process.env.DISCORD_TOKEN
     * @param options Default set to DEFAULT_DISCORD_OPTIONS
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
    /**
     * @description Start the bot with the given classes.
     * @param classes Array of OxyBotFeature classes to start with the bot.
     * @throws Error if the token is not set.
     */
    Start(classes = []) {
        if (this.token === null) {
            throw new Error('Token is not set, cannot start the bot.');
        }
        this.classes = classes;
        this.classes.forEach(classs => classs.bot = this);
        this.client.login(this.token);
        process.addListener('SIGINT', this.destructor.bind(this));
    }
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
     * @description Event called when the bot is ready.
     */
    onReady(client) {
        console.log(`Logged in as '${client.user?.tag}'!`);
        this.InitSlashCommands();
        for (let i = 0; i < this.classes.length; i++) {
            this.classes[i].onReady();
        }
    }
    /**
     * @description Event called when a message is received.
     */
    onMessage(message) {
        for (let i = 0; i < this.classes.length; i++) {
            this.classes[i].parseMessage(message);
        }
    }
    /**
     * @description Event called when a interaction is received.
     */
    onInteraction(interaction) {
        for (let i = 0; i < this.classes.length; i++) {
            this.classes[i].parseInteraction(interaction);
        }
    }
    /**
     * @description Initialize slash commands for the bot.
     * @throws Error if the client user or token is not set.
     */
    async InitSlashCommands() {
        if (this.client.user === null) {
            throw new Error('Client user is not set, cannot initialize slash commands.');
        }
        if (this.token === null) {
            throw new Error('Token is not set, cannot initialize slash commands.');
        }
        const rest = new REST({ version: '10' }).setToken(this.token);
        try {
            const commands = [];
            for (let i = 0; i < this.classes.length; i++) {
                const classe = this.classes[i];
                const slashCommands = await classe.DefineSlashCommands();
                commands.push(...slashCommands);
            }
            await rest.put(Routes.applicationCommands(this.client.user.id), { body: commands });
            console.log('SlashCommands saved');
        }
        catch (error) {
            console.error(error);
        }
    }
    ;
}
export { OxyBotFeature };
export default OxyBot;
