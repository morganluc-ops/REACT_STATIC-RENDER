# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.1.0] - 2026-08-20

### ? Améliorations
- Optimization du hook de rendu statique et nettoyage du code.
- Amélioration de la stabilité du rendu lors des interactions et du survol.

### ??? CI / CD & Tooling
- Mise à niveau des workflows GitHub Actions (ctions/checkout@v4, ctions/setup-node@v4).
- Resolution des conflits de push non-fast-forward lors du versioning automatique.
- Ajout du paramètre dry_run pour simuler les déploiements manuels.

---

## [1.0.0] - 2026-08-06

### ?? Initial Release
- Premier lancement de la bibliothèque eact-static-render.
- Rendu initial sous forme HTML statique ultra-léger.
- Hydratation différée au survol (hover).
