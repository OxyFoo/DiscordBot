# DiscordBot (npm lib)
Architecture des bots discord de l'entreprise

## Configuration
Définir les variables d'environnement suivantes (ou fichier .env)
```
DISCORD_TOKEN=<YOUR_BOT_TOKEN>
```

## New feature
Pour ajouter une feature:

1. Ajouter un répertoire avec le nom de la feature dans ./src/features/
2. Ajouter un fichier `index.js` avec le contenu suivant
```js
import BotFeature from 'discordbot';

/**
 * @typedef {import('discordbot').Message} Message
 * @typedef {import('discordbot').Interaction} Interaction
 */

class FEATURE_NAME extends BotFeature {
    async onReady() {
    }

    /** @param {Message} message */
    async onMessage(message) {
        return false;
    }

    /** @param {Interaction} interaction */
    async onInteraction(interaction) {
        return false;
    }
}

export default FEATURE_NAME;
```
3. Ajouter la fonctionnalité (et son import) dans le fichier `index.js` au démarrage du bot