# OxyBot (npm lib)

Architecture des bots discord pour l'entreprise OxyFoo.

## Configuration

Définir les variables d'environnement suivantes (ou fichier .env)
```
DISCORD_TOKEN=<YOUR_BOT_TOKEN>
```

## New feature

Pour ajouter une feature:

1. Ajouter un répertoire avec le nom de la feature dans ./src/features/
2. Ajouter un fichier `index.ts` avec le contenu suivant

```ts
import OxyBotFeature from 'oxybot';

import type { Message, Interaction } from 'oxybot';

class FEATURE_NAME extends OxyBotFeature {
    async onReady() {
    }

    async onMessage(message: Message) {
        return false;
    }

    async onInteraction(interaction: Interaction) {
        return false;
    }
}

export default FEATURE_NAME;
```

3. Ajouter la fonctionnalité (et son import) dans le fichier `index.ts` au démarrage du bot
