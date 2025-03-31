# DevDock

DevDock est une plateforme tout-en-un qui orchestre Supabase pour la gestion de base de données, n8n pour l'automatisation des flux de travail, et code-server pour le développement à distance. DevDock offre une interface unifiée permettant aux équipes de développer, automatiser et déployer sans quitter leur navigateur.

## Architecture

Le projet est structuré en plusieurs composants Docker indépendants mais interconnectés :

- **Supabase** : Infrastructure backend complète avec PostgreSQL, authentification, stockage
- **n8n** : Plateforme de workflow automation No-Code
- **code-server** : IDE VS Code accessible via navigateur
- **Caddy** : Serveur web et proxy reverse, gestion des certificats SSL

## Prérequis

- Docker et Docker Compose
- Git
- 4 Go de RAM minimum (8 Go recommandés)
- 20 Go d'espace disque

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/benoitadam/DevDock.git
   cd DevDock
   ```

2. Configurez vos variables d'environnement :
   ```bash
   cp .env.example .env
   # Éditez .env avec vos configurations
   ```

3. Générez les configurations :
   ```bash
   ./generator.sh
   ```

4. Lancez la stack complète :
   ```bash
   ./up.sh
   ```

## Utilisation

Une fois installé, les services suivants sont disponibles :

- **Supabase** : http://localhost:8000
- **n8n** : http://localhost:5678
- **code-server** : http://localhost:8443
- **pgAdmin** : http://localhost:5050

Pour accéder à l'interface unifiée principale, visitez :
- http://localhost

## Commandes utiles

```bash
# Démarrer tous les services
./up.sh

# Arrêter tous les services
./down.sh

# Démarrer un seul service (exemple avec n8n)
cd n8n && ./up.sh

# Copier des données entre volumes Docker
./copy_volume.sh
```

## Structure du projet

```
server/
├── *generated/          # Fichiers générés automatiquement
├── caddy/               # Configuration et Dockerfile pour Caddy
├── code/                # Configuration code-server
├── n8n/                 # Configuration n8n
├── supabase/            # Configuration Supabase
├── workspace/           # Espace de travail partagé
│   ├── my-admin/        # Application admin (Vue/Vite)
│   ├── sql/             # Scripts SQL
│   └── www/             # Fichiers web statiques
└── ...                  # Scripts utilitaires
```

## Maintenance

### Sauvegardes

Les données sont stockées dans des volumes Docker. Pour sauvegarder :

```bash
docker volume ls  # Listez les volumes
docker volume inspect <nom_volume>  # Trouvez l'emplacement
# Sauvegardez le dossier correspondant
```

### Mise à jour

```bash
git pull  # Récupérer les dernières modifications
./down.sh  # Arrêter les services
./generator.sh  # Regénérer les configurations
./up.sh  # Redémarrer les services
```

## Dépannage

### Logs

Pour voir les logs d'un service spécifique :
```bash
cd <service> && docker-compose logs -f
```

### Problèmes courants

- **Erreur de port** : Vérifiez qu'aucun autre service n'utilise les ports requis
- **Problèmes de mémoire** : Augmentez la RAM allouée à Docker
- **Erreurs Supabase** : Vérifiez les logs et redémarrez le service

## Licence

Voir le fichier [LICENSE](LICENSE) pour plus de détails.