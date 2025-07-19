"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OxyBotFeature = void 0;
require("dotenv/config");
const rest_1 = require("@discordjs/rest");
const v10_1 = require("discord-api-types/v10");
const discord_js_1 = require("discord.js");
const feature_js_1 = __importDefault(require("./src/feature.js"));
exports.OxyBotFeature = feature_js_1.default;
const utils_js_1 = require("./src/utils.js");
const DEFAULT_DISCORD_OPTIONS = {
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages
    ],
    partials: [
        discord_js_1.Partials.Channel
    ]
};
class OxyBot {
    /**
     * @param token Default set to process.env.DISCORD_TOKEN
     * @param options Default set to DEFAULT_DISCORD_OPTIONS
     */
    constructor(token = null, options = null) {
        this.token = process.env.DISCORD_TOKEN || null;
        this.classes = [];
        if (token !== null) {
            this.token = token;
        }
        this.client = new discord_js_1.Client(options || DEFAULT_DISCORD_OPTIONS);
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
    destructor() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('\nExiting...');
            process.removeAllListeners('SIGINT');
            for (let i = 0; i < this.classes.length; i++) {
                yield this.classes[i].onClose();
            }
            this.client.destroy();
            yield (0, utils_js_1.Sleep)(1000);
            process.exit(0);
        });
    }
    /**
     * @description Event called when the bot is ready.
     */
    onReady(client) {
        var _a;
        console.log(`Logged in as '${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}'!`);
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
    InitSlashCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.user === null) {
                throw new Error('Client user is not set, cannot initialize slash commands.');
            }
            if (this.token === null) {
                throw new Error('Token is not set, cannot initialize slash commands.');
            }
            const rest = new rest_1.REST({ version: '10' }).setToken(this.token);
            try {
                const commands = [];
                for (let i = 0; i < this.classes.length; i++) {
                    const classe = this.classes[i];
                    const slashCommands = yield classe.DefineSlashCommands();
                    commands.push(...slashCommands);
                }
                yield rest.put(v10_1.Routes.applicationCommands(this.client.user.id), { body: commands });
                console.log('SlashCommands saved');
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    ;
}
exports.default = OxyBot;
