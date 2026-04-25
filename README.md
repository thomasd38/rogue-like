# 🎮 Project: Void Drifter

## 🧠 Project Overview

A fast-paced 2D arcade roguelike where the player controls a horizontal-moving cannon at the bottom of the screen, shooting projectiles upward at descending blocks.

The game focuses on:

* Simple mechanics
* High replayability
* Synergy-based upgrades
* Short, intense runs

---

## 🎯 Core Gameplay

### Player

* Moves horizontally along the bottom of the screen
* Automatically shoots projectiles upward
* Can collect upgrades between rooms
* Has a health system (HP-based, not one-shot)

### Shooting

* Default: single projectile, vertical
* Modifiers can add:

  * Multi-shot (fixed angles, e.g. ±10°, ±20°)
  * Increased fire rate
  * Increased damage
  * Special effects (piercing, explosion, etc.)

### Enemies (Blocks)

* Descend from the top of the screen
* Each block has HP (displayed as a number)
* On collision:

  * Touching player → damage

---

## 🔁 Game Loop (Roguelike)

1. Enter a room (wave of blocks)
2. Survive and destroy all enemies
3. Choose 1 upgrade from 2–3 options
4. Repeat
5. Boss room
6. Next world
7. Death = full reset (no meta progression)

---

## 🧱 Rooms

* Fixed screen (no camera movement)
* Spawn patterns define difficulty
* Increasing intensity over time
* No procedural map needed for V1 (linear progression)

---

## 👾 Boss Design (V1)

Bosses must remain simple:

* Large HP pool
* May spawn additional blocks
* Simple patterns (no complex AI)

Examples:

* Splitting block
* Slow descending wall
* Spawner boss

---

## ⚙️ Systems

### Stats

* Fire rate
* Projectile count
* Damage
* Projectile speed
* Player speed

### Upgrades

Each upgrade must be:

* Simple to understand
* Stackable
* Synergistic

Categories:

* Offensive (damage, multi-shot, effects)
* Defensive (HP, shield, regen)
* Utility (slow, crit, etc.)

---

## 🧪 MVP Scope (STRICT)

DO NOT EXCEED THIS SCOPE FOR V1

* 1 player entity
* 1 enemy type (block)
* 1 boss
* 5–8 upgrades
* 1 world
* Basic UI (HP, upgrades)
* No sound required
* No assets required (use shapes)

---

## 🏗️ Technical Architecture

### Stack

* HTML
* CSS
* JavaScript (Vanilla)
* Canvas API

### Main Systems

* Game (main loop, state management)
* Player (movement, shooting)
* Projectile (movement, collision)
* Enemy (block logic)
* Room (spawning logic)
* Upgrade System
* Collision System

---

## 🔄 Game Loop (Technical)

Use `requestAnimationFrame`

Each frame:

1. Update player
2. Update projectiles
3. Update enemies
4. Handle collisions
5. Render everything

---

## 🎮 Controls

* Keyboard:

  * Left / Right arrows OR Q / D → movement

* Controller:

  * Left stick → movement

* Shooting:

  * Automatic

---

## 📐 Design Constraints

* Keep everything minimal
* No unnecessary abstractions
* No over-engineering
* Prioritize gameplay feel over visuals
* Use simple shapes (rectangles, circles)

---

## 🚀 Roadmap

### Phase 1 (Core)

* Player movement
* Shooting system
* Basic projectile

### Phase 2 (Gameplay)

* Enemy spawning
* Collision system
* HP system

### Phase 3 (Loop)

* Room clear condition
* Upgrade selection system

### Phase 4 (Content)

* Add upgrades
* Add boss

### Phase 5 (Polish)

* Basic UI
* Feedback (screen shake, hit effects)

---

## ⚠️ Important Rules for AI Agents

* DO NOT expand scope beyond MVP
* DO NOT introduce complex systems prematurely
* ALWAYS keep code simple and readable
* PRIORITIZE a playable prototype as fast as possible
* TEST frequently (game must always run)

---

## ✅ Definition of Done (V1)

* Game is playable from start to death
* At least 1 full run possible
* Upgrades impact gameplay noticeably
* No critical bugs
* Runs in browser via GitHub Pages

---

## 🧩 Future Ideas (Post-V1)

* Multiple enemy types
* More bosses
* Visual polish
* Sound effects
* Meta progression (optional)

---
