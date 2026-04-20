const RARITIES = [
    { id: 'common', name: 'Common', color: '#ffffff', weight: 50 },
    { id: 'uncommon', name: 'Uncommon', color: '#2ecc71', weight: 30 },
    { id: 'rare', name: 'Rare', color: '#3498db', weight: 12 },
    { id: 'epic', name: 'Epic', color: '#9b59b6', weight: 6 },
    { id: 'legendary', name: 'Legendary', color: '#e67e22', weight: 2 }
];

const UPGRADE_TYPES = [
    {
        id: 'damage_up',
        name: 'Damage',
        values: [5, 8, 12, 20, 35], // Values for each rarity
        getDescription: (val) => `Projectile Damage +${val}`,
        apply: (player, val) => { player.projectileDamage += val; }
    },
    {
        id: 'fire_rate_up',
        name: 'Fire Rate',
        values: [10, 15, 20, 30, 50], // Percentage reduction in fire delay
        getDescription: (val) => `Fire Delay -${val}%`,
        apply: (player, val) => {
            player.fireRate = Math.max(5, Math.floor(player.fireRate * (1 - val / 100)));
        }
    },
    {
        id: 'multi_shot',
        name: 'Multi-Shot',
        values: [1, 1, 2, 2, 3], // Additional projectiles
        getDescription: (val) => `Projectiles +${val}`,
        apply: (player, val) => { player.projectileCount += val; }
    },
    {
        id: 'heal',
        name: 'Vitality',
        values: [1, 1, 2, 2, 3],
        getDescription: (val) => `Restore or Gain +${val} Max HP`,
        apply: (player, val) => {
            for (let i = 0; i < val; i++) {
                if (player.hp < player.maxHp) {
                    player.hp += 1;
                } else {
                    player.maxHp += 1;
                    player.hp += 1;
                }
            }
        }
    },
    {
        id: 'speed_up',
        name: 'Speed',
        values: [1, 1.5, 2, 3, 5],
        getDescription: (val) => `Movement Speed +${val}`,
        apply: (player, val) => { player.speed += val; }
    }
];

class UpgradeManager {
    static getRandomRarity() {
        const totalWeight = RARITIES.reduce((sum, r) => sum + r.weight, 0);
        let random = Math.random() * totalWeight;

        for (const rarity of RARITIES) {
            random -= rarity.weight;
            if (random <= 0) return rarity;
        }
        return RARITIES[0]; // Fallback
    }

    static getRandomUpgrades(count = 3) {
        // Shuffle types and pick 'count' unique types to avoid offering 3 Damage Ups
        const shuffledTypes = [...UPGRADE_TYPES].sort(() => 0.5 - Math.random());
        const selectedTypes = shuffledTypes.slice(0, count);

        // Generate a specific instance with a rarity for each selected type
        return selectedTypes.map(type => {
            const rarity = this.getRandomRarity();
            const rarityIndex = RARITIES.indexOf(rarity);
            const value = type.values[rarityIndex];

            return {
                id: type.id,
                name: type.name,
                rarity: rarity,
                value: value,
                description: type.getDescription(value),
                apply: (player) => type.apply(player, value)
            };
        });
    }
}
