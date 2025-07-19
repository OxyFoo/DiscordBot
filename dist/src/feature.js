class OxyBotFeature {
    bot = null;
    /** If it has at least one id, only messages from these channels will be sent */
    channelWhitelist = [];
    /** Messages from these channels will be ignored (priority) */
    channelBlacklist = [];
    /** Elements for transferring events to child classes */
    childs = [];
    /**
     * @description Called when bot is started
     */
    onReady() { }
    /**
     * @description Called before bot closing
     */
    async onClose() { }
    /**
     * @description Return slash command to add to bot
     */
    async DefineSlashCommands() {
        return [];
    }
    /**
     * @description Called when a message is sended and pass through filters
     * @returns True if message is interpreted
     */
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    async onMessage(message) {
        return false;
    }
    /**
     * @description Called when a interaction is sended and pass through filters
     * @returns True if interaction is interpreted
     */
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    async onInteraction(interaction) {
        return false;
    }
    /*************************************/
    /**        PRIVATE FUNCTIONS        **/
    /*************************************/
    /**
     * Called when a message is sended and call event if message pass through filter functions
     * @returns True if message is interpreted
     */
    async parseMessage(message) {
        let output = this.filter(message.channelId) && await this.onMessage(message);
        output ||= await this.parseChilds(message);
        return output;
    }
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
     * @returns True if interaction is interpreted
     */
    async parseInteraction(interaction) {
        let output = this.filter(interaction.channelId) && await this.onInteraction(interaction);
        output ||= await this.parseInteractionChilds(interaction);
        return output;
    }
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
        keep &&= !this.channelBlacklist.includes(channelID);
        return keep;
    }
}
export default OxyBotFeature;
