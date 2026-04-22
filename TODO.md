# Bilan et Améliorations du Projet (Rogue-like)

Ce document liste les améliorations proposées suite à la relecture du code initial du projet.

## 🐞 1. Bugs et erreurs logiques à corriger
- [x] **Le bug du Laser du Boss (Critique)** : Dans `boss.js`, `checkLaserCollision()` n'est appelée qu'une seule fois à la frame exacte de transition entre `WARNING` et `FIRING`. Il faut l'appeler à chaque frame pendant l'état `FIRING`.
- [x] **Les ennemis HEALER peuvent soigner le Boss** : La méthode `applyHealer` vérifie tous les `game.enemies`, ce qui peut soigner les autres healers (boucle) ou potentiellement le boss. (Correction : les Healers ne soignent plus les autres Healers).
- [x] **Renommer le mode "Fast Play" en "Boss Rush"** : Le nom a été changé pour mieux refléter son usage de test rapide et d'enchaînement de boss.
- [/] **Le mode "Boss Rush" est rapide** : Note : La durée de 3s est intentionnelle pour les tests rapides de l'utilisateur. Task retirée du bilan des bugs.

## 🎮 2. Gameplay et Équilibrage
- [x] **Mouvement restreint vs Patterns complexes** : Le joueur peut maintenant bouger sur les axes X et Y sans restriction (Z/W/Up, S/Down). Le contrôle mobile a été corrigé pour éviter la téléportation.
- [ ] **Upgrades Uniques trop rares** : Les upgrades méta comme `wave_economy` (Reroll) et `mad_buyer` (+1 Choix) ne s'obtiennent qu'après avoir battu un boss. Les passer dans le pool classique (rareté Épique/Légendaire) les rendrait plus accessibles.

## ✨ 3. Game Feel (Retours visuels)
- [x] **Explosions invisibles** : Ajout d'un effet visuel (cercles concentriques orange/jaune) lors du déclenchement d'une explosion.
- [x] **Hit Flash** : Les ennemis et les boss clignotent désormais en blanc pendant quelques frames lorsqu'ils reçoivent des dégâts.
- [x] **Screen Shake (Tremblement d'écran)** : Le canvas tremble désormais lors d'une explosion ou lorsque le joueur perd des HP.

## ⚙️ 4. Optimisation et Maintenabilité
- [ ] **Garbage Collection et Ralentissements** : `game.js` filtre le tableau des projectiles (`this.projectiles.filter`) à chaque frame, créant de nouveaux arrays et pouvant causer des micro-saccades. Utiliser une itération inversée avec `.splice()` ou recycler les objets (object pooling).
- [ ] **Taille du fichier Game** : Extraire la logique des collisions hors du fichier principal `game.js` (par exemple vers un `CollisionManager`) pour alléger le Game Loop.
