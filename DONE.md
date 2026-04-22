# Tâches Terminées

Ce document garde une trace de toutes les améliorations et corrections qui ont été effectuées depuis l'analyse initiale.

## 🐞 1. Bugs et erreurs logiques corrigés
- [x] **Le bug du Laser du Boss (Critique)** : Correction appliquée dans `boss.js`. La fonction `checkLaserCollision()` est désormais appelée à chaque frame pendant que le laser est dans l'état `FIRING`, assurant que le joueur prenne des dégâts s'il entre dans la zone du laser pendant le tir.
- [x] **Le bug de soin des Healers** : Correction appliquée dans `js/enemy.js`. Les Healers ne peuvent plus soigner d'autres Healers, ce qui évite les situations de "stall" où deux Healers se soignent mutuellement à l'infini. Ils ne soignent désormais que les troupes offensives (Grunts, Tanks, etc.).
- [x] **Renommage du mode "Fast Play" en "Boss Rush"** : Mise à jour de l'interface (HTML), du HUD (Canvas) et du code interne (JS) pour utiliser le nom "Boss Rush", plus parlant pour ce mode de test rapide.
- [x] **Mouvement sur l'axe Y (Haut/Bas)** : Ajout du support des touches Z, W, S et des flèches pour le mouvement vertical. Le joueur peut désormais naviguer sur tout l'écran.
- [x] **Correction du contrôle mobile (Suivi du point de contact)** : Refonte du système tactile. Le vaisseau se dirige désormais vers le point touché par le joueur à sa vitesse normale (pas de téléportation). Un décalage vertical (offset) a été ajouté pour que le vaisseau reste visible juste au-dessus du doigt du joueur, améliorant ainsi la visibilité et la précision.
