# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### 💡 À venir
- Détection automatique de l'entrée dans le viewport (IntersectionObserver).

---

## [1.1.0] - 2026-08-20

### 🚀 Nouveautés & Fonctionnalités
- **useStaticRender Hook** :
  - Nettoyage et optimisation de la logique d'hydratation différée au survol (onMouseEnter / onFocus).
  - Réduction de la taille du bundle minifié sous la barre des **1 KB**.

### 🐛 Correctifs de Bugs
- **Fix (Linter & Types)** : Résolution des avertissements ESLint (ules-of-hooks, types explicites) et correction des typages TypeScript exportés dans le bundle.
- **Fix (Git & Release)** : Résolution des échecs de déploiement non-fast-forward et de l'erreur 
pm error Git working directory not clean causée par les artefacts de build résiduels (
pm version --force).

### 🛠️ CI / CD & Tooling
- **GitHub Actions** : 
  - Migration des actions obsolètes vers les versions stables officiellement supportées (ctions/checkout@v4, ctions/setup-node@v4).
  - Ajout du paramètre interactif dry_run (boolean) pour permettre de simuler l'ensemble du pipeline de publication sur NPM sans altérer le registre public ni pusher de tags.
  - Automatisation de la génération des *Release Notes* GitHub basées directement sur le contenu de ce fichier CHANGELOG.md.

---

## [1.0.0] - 2026-08-06

### 🚀 Initial Release
- Lancement de la version initiale de la bibliothèque eact-static-render.
- Support du rendu statique ultra-léger avec bascule dynamique vers le composant React interactif lors du survol.
