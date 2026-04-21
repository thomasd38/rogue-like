# Ennemis et Boss disponibles

Ce document décrit **tous les ennemis et boss** actuellement présents dans le jeu, ainsi que leur comportement dans les vagues.

---

## Ennemis standards

### 1) Grunt
- **Rôle**: ennemi de base.
- **Comportement**: descend simplement vers le bas.
- **Danger**: faible individuellement, dangereux en surnombre.

### 2) Tracker
- **Rôle**: pression ciblée sur le joueur.
- **Comportement**: descend et ajuste sa position horizontalement pour suivre le canon.
- **Danger**: empêche de rester statique.

### 3) Tank
- **Rôle**: mur de PV.
- **Comportement**: descend lentement mais avec une grosse barre de vie.
- **Danger**: absorbe beaucoup de projectiles.

### 4) Zigzag
- **Rôle**: perturbateur de trajectoire.
- **Comportement**: descend en oscillant horizontalement (mouvement sinusoïdal).
- **Danger**: difficile à viser avec un tir unique.

### 5) Dasher
- **Rôle**: burst de mobilité.
- **Comportement**: descend normalement puis déclenche des dashs horizontaux rapides vers la zone du joueur.
- **Danger**: provoque des collisions surprises.

### 6) Shooter
- **Rôle**: soutien à distance.
- **Comportement**: descend et tire des projectiles vers le joueur à intervalle régulier.
- **Danger**: oblige à esquiver tout en gérant les autres ennemis.

### 7) Splitter
- **Rôle**: multiplication de menaces.
- **Comportement**: à sa mort, se divise en petits ennemis rapides.
- **Danger**: si tu le tues dans un mauvais timing/positionnement, l'écran se remplit.

### 8) Healer
- **Rôle**: support défensif.
- **Comportement**: émet des pulsations qui soignent les ennemis proches.
- **Danger**: rallonge fortement la durée des packs ennemis.

---

## Répartition des ennemis par progression

Les vagues normales n'utilisent plus une seule variante: la sélection est pondérée et évolue avec le numéro de vague.

- Début de run: surtout **Grunt** / **Tracker**.
- Milieu de run: apparition de **Zigzag**, **Dasher**, **Shooter**.
- Plus loin: montée de **Tank**, **Splitter**, **Healer**.

Cela crée des combinaisons de plus en plus variées (pression, tanking, soin, tir à distance, chaos au kill).

---

## Boss disponibles (vagues boss)

Chaque vague boss choisit un boss parmi plusieurs archétypes.

### A) Siege Core
- Laser vertical avec phase d'avertissement puis tir.
- Tirs ciblés vers le joueur.
- Invocation régulière de sbires.

### B) Twin Hydra
- Déplacements rapides.
- Salves en cône (spread shots).
- Invoque des dashers/trackers pour saturer la mobilité du joueur.

### C) War Forge
- Très gros total de PV.
- Cadence de tirs soutenue.
- Invoque des vagues lourdes (tank, shooter, healer).

### D) Void Prism
- Téléportation horizontale périodique.
- Burst radial de projectiles (attaque circulaire).
- Invoque des splitters/zigzags pour semer le chaos.

---

## Variété ajoutée

La diversité est maintenant sur trois axes:

1. **Mouvements** (tracking, zigzag, dash).
2. **Rôle tactique** (tank, healer, shooter, splitter).
3. **Patterns boss multiples** (laser, spread, radial, téléportation, invocations spécialisées).

En conséquence, chaque vague peut proposer des combats très différents, et les boss ont chacun une identité marquée.
