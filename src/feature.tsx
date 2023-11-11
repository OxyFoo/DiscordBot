type Bot = import('../index.js').default;
type Message = import('discord.js').Message;
type Interaction = import('discord.js').Interaction;
type SlashCommandBuilder = import('discord.js').SlashCommandBuilder;

interface BotFeature {
    bot: Bot | null;
    channelWhitelist: string[];
    channelBlacklist: string[];
    childs: BotFeature[];

    onReady(): void;
    onClose(): Promise<void>;
    DefineSlashCommands(): Promise<Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">[]>;
    onMessage(message: Message): Promise<boolean>;
    onInteraction(interaction: Interaction): Promise<boolean>;

    parseMessage(message: Message): Promise<boolean>;
    parseInteraction(interaction: Interaction): Promise<boolean>;
}

class BotFeatureImpl implements BotFeature {
    bot: Bot | null = null;
    channelWhitelist: string[] = [];
    channelBlacklist: string[] = [];
    childs: BotFeature[] = [];

    onReady() {
    }

    async onClose() {
    }

    async DefineSlashCommands() {
        return [];
    }

    /**
     * @description Called when a message is sended and pass through filters
     */
    async onMessage(message: Message) {
        return false;
    }
    /**
     * @description Called when an interaction is sended and pass through filters
     */
    async onInteraction(interaction: Interaction) {
        return false;
    }

    async parseMessage(message: Message) {
        let output = this.filter(message.channelId) && await this.onMessage(message);
        output ||= await this.parseChilds(message);
        return output;
    }

    private async parseChilds(message: Message) {
        let output = false;
        for (const child of this.childs) {
            if (await child.parseMessage(message)) {
                output = true;
            }
        }
        return output;
    }

    async parseInteraction(interaction: Interaction) {
        if (interaction.channelId === null) return false;
        let output = this.filter(interaction.channelId) && await this.onInteraction(interaction);
        output ||= await this.parseInteractionChilds(interaction);
        return output;
    }

    private async parseInteractionChilds(interaction: Interaction) {
        let output = false;
        for (const child of this.childs) {
            if (await child.parseInteraction(interaction)) {
                output = true;
            }
        }
        return output;
    }

    private filter(channelID: string) {
        let keep = true;
        if (this.channelWhitelist.length) {
            keep = this.channelWhitelist.includes(channelID);
        }
        keep &&= !this.channelBlacklist.includes(channelID);
        return keep;
    }
}

export default BotFeatureImpl;
