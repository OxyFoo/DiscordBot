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
Object.defineProperty(exports, "__esModule", { value: true });
class OxyBotFeature {
    constructor() {
        this.bot = null;
        /** If it has at least one id, only messages from these channels will be sent */
        this.channelWhitelist = [];
        /** Messages from these channels will be ignored (priority) */
        this.channelBlacklist = [];
        /** Elements for transferring events to child classes */
        this.childs = [];
    }
    /**
     * @description Called when bot is started
     */
    onReady() { }
    /**
     * @description Called before bot closing
     */
    onClose() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * @description Return slash command to add to bot
     */
    DefineSlashCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    /**
     * @description Called when a message is sended and pass through filters
     * @returns True if message is interpreted
     */
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    onMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    /**
     * @description Called when a interaction is sended and pass through filters
     * @returns True if interaction is interpreted
     */
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    onInteraction(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    /*************************************/
    /**        PRIVATE FUNCTIONS        **/
    /*************************************/
    /**
     * Called when a message is sended and call event if message pass through filter functions
     * @returns True if message is interpreted
     */
    parseMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = this.filter(message.channelId) && (yield this.onMessage(message));
            output || (output = yield this.parseChilds(message));
            return output;
        });
    }
    parseChilds(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = false;
            for (let c = 0; c < this.childs.length; c++) {
                const child = this.childs[c];
                const childParse = child.parseMessage.bind(child);
                if (yield childParse(message)) {
                    output = true;
                }
            }
            return output;
        });
    }
    /**
     * Called when an interaction is sended and call event if interaction pass through filter functions
     * @returns True if interaction is interpreted
     */
    parseInteraction(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = this.filter(interaction.channelId) && (yield this.onInteraction(interaction));
            output || (output = yield this.parseInteractionChilds(interaction));
            return output;
        });
    }
    parseInteractionChilds(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = false;
            for (let c = 0; c < this.childs.length; c++) {
                const child = this.childs[c];
                const parseInteractionChild = child.parseInteraction.bind(child);
                if (yield parseInteractionChild(interaction)) {
                    output = true;
                }
            }
            return output;
        });
    }
    /**
     * @returns True if channel isn't in blacklist or it's in whitelist
     */
    filter(channelID) {
        if (channelID === null) {
            return false;
        }
        let keep = true;
        if (this.channelWhitelist.length) {
            keep = this.channelWhitelist.includes(channelID);
        }
        keep && (keep = !this.channelBlacklist.includes(channelID));
        return keep;
    }
}
exports.default = OxyBotFeature;
