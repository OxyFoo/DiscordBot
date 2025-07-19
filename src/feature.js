/**
 * @typedef {import('../index.js').default} Bot
 * @typedef {import('discord.js').Message} Message
 * @typedef {import('discord.js').Interaction} Interaction
 * @typedef {import('discord.js').SlashCommandBuilder} SlashCommandBuilder
 */

class OxyBotFeature {
    /** @type {Bot|null} */
    bot = null;

    /**
     * @description If it has at least one id, only messages from these channels will be sent
     * @type {Array<string>}
     */
    channelWhitelist = [];

    /**
     * @description Messages from these channels will be ignored (priority)
     * @type {Array<string>}
     */
    channelBlacklist = [];

    /**
     * @description Elements for transferring events to child classes
     * @type {Array<OxyBotFeature>}
     */
    childs = [];



    /**
     * @description Called when bot is started
     */
    onReady() {}

    /**
     * @description Called before bot closing
     */
    async onClose() {}

    /**
     * @description Return slash command to add to bot
     * @returns {Promise<Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">[]>}
     */
    async DefineSlashCommands() {
        return [];
    }

    /**
     * @description Called when a message is sended and pass through filters
     * @param {Message} message
     * @returns {Promise<boolean>} True if message is interpreted
     */
    async onMessage(message) {
        return false;
    }

    /**
     * @description Called when a interaction is sended and pass through filters
     * @param {Interaction} interaction
     * @returns {Promise<boolean>} True if interaction is interpreted
     */
    async onInteraction(interaction) {
        return false;
    }


    /*************************************/
    /**        PRIVATE FUNCTIONS        **/
    /*************************************/



    /**
     * Called when a message is sended and call event if message pass through filter functions
     * @param {Message} message
     * @returns {Promise<boolean>} True if message is interpreted
     */
    async parseMessage(message) {
        let output = this.filter(message.channelId) && await this.onMessage(message);
        output ||= await this.parseChilds(message);
        return output;
    }

    /**
     * @private
     * @param {Message} message
     * @returns {Promise<boolean>}
     */
    async parseChilds(message) {
        let output = false;
        for (let c = 0; c < this.childs.length; c++) {
            const child = this.childs[c];
            const childParse = child.parseMessage.bind(child);
            if (await childParse(message)) {
                output = true;
            }
        }
        return output;
    }

    /**
     * Called when an interaction is sended and call event if interaction pass through filter functions
     * @param {Interaction} interaction
     * @returns {Promise<boolean>} True if interaction is interpreted
     */
    async parseInteraction(interaction) {
        let output = this.filter(interaction.channelId) && await this.onInteraction(interaction);
        output ||= await this.parseInteractionChilds(interaction);
        return output;
    }

    /**
     * @private
     * @param {Interaction} interaction
     * @returns {Promise<boolean>}
     */
    async parseInteractionChilds(interaction) {
        let output = false;
        for (let c = 0; c < this.childs.length; c++) {
            const child = this.childs[c];
            const parseInteractionChild = child.parseInteraction.bind(child);
            if (await parseInteractionChild(interaction)) {
                output = true;
            }
        }
        return output;
    }

    /**
     * @private
     * @param {string} channelID
     * @returns {boolean} True if channel isn't in blacklist or it's in whitelist
     */
    filter(channelID) {
        let keep = true;
        if (this.channelWhitelist.length) {
            keep = this.channelWhitelist.includes(channelID);
        }
        keep &&= !this.channelBlacklist.includes(channelID);
        return keep;
    }
}

export default OxyBotFeature;
