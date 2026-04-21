const RARITIES = [
    { id: 'common', name: 'Common', color: '#ffffff', weight: 50 },
    { id: 'uncommon', name: 'Uncommon', color: '#2ecc71', weight: 30 },
    { id: 'rare', name: 'Rare', color: '#3498db', weight: 12 },
    { id: 'epic', name: 'Epic', color: '#9b59b6', weight: 6 },
    { id: 'legendary', name: 'Legendary', color: '#e67e22', weight: 2 }
];

const RARITY_ORDER = RARITIES.map(r => r.id);
const getRarityById = (id) => RARITIES.find(r => r.id === id);

const UPGRADE_TYPES = [
    {
        id: 'damage_up',
        name: 'Damage',
        tiers: [
            { rarity: 'common', value: 5 },
            { rarity: 'uncommon', value: 8 },
            { rarity: 'rare', value: 12 },
            { rarity: 'epic', value: 20 },
            { rarity: 'legendary', value: 35 }
        ],
        getDescription: (val) => `Projectile Damage +${val}`,
        apply: (player, val) => { player.projectileDamage += val; }
    },
    {
        id: 'fire_rate_up',
        name: 'Fire Rate',
        tiers: [
            { rarity: 'common', value: 10 },
            { rarity: 'uncommon', value: 15 },
            { rarity: 'rare', value: 20 },
            { rarity: 'epic', value: 30 },
            { rarity: 'legendary', value: 50 }
        ],
        getDescription: (val) => `Fire Delay -${val}%`,
        apply: (player, val) => {
            player.fireRate = Math.max(5, Math.floor(player.fireRate * (1 - val / 100)));
        }
    },
    {
        id: 'multi_shot',
        name: 'Multi-Shot',
        tiers: [
            { rarity: 'common', value: 1 },
            { rarity: 'uncommon', value: 1 },
            { rarity: 'rare', value: 2 },
            { rarity: 'epic', value: 2 },
            { rarity: 'legendary', value: 3 }
        ],
        getDescription: (val) => `Projectiles +${val}`,
        apply: (player, val) => { player.projectileCount += val; }
    },
    {
        id: 'heal',
        name: 'Vitality',
        tiers: [
            { rarity: 'common', value: 1 },
            { rarity: 'uncommon', value: 1 },
            { rarity: 'rare', value: 2 },
            { rarity: 'epic', value: 2 },
            { rarity: 'legendary', value: 3 }
        ],
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
        tiers: [
            { rarity: 'common', value: 1 },
            { rarity: 'uncommon', value: 1.5 },
            { rarity: 'rare', value: 2 },
            { rarity: 'epic', value: 3 },
            { rarity: 'legendary', value: 5 }
        ],
        getDescription: (val) => `Movement Speed +${val}`,
        apply: (player, val) => { player.speed += val; }
    },
    {
        id: 'pierce_rounds',
        name: 'Pierce',
        tiers: [
            { rarity: 'uncommon', value: 1 },
            { rarity: 'rare', value: 2 },
            { rarity: 'epic', value: 3 }
        ],
        getDescription: (val) => `Projectiles Pierce +${val} enemies`,
        apply: (player, val) => { player.pierce += val; }
    },
    {
        id: 'explosive_rounds',
        name: 'Explosive',
        tiers: [
            { rarity: 'rare', value: 45 },
            { rarity: 'epic', value: 60 },
            { rarity: 'legendary', value: 75 }
        ],
        getDescription: (val) => `Shots explode in AOE (${val}px radius)`,
        apply: (player, val) => { player.explosiveRadius = Math.max(player.explosiveRadius, val); }
    },
    {
        id: 'critical_boost',
        name: 'Crit',
        tiers: [
            { rarity: 'rare', value: { chance: 0.12, mult: 0.35 } },
            { rarity: 'epic', value: { chance: 0.18, mult: 0.5 } },
            { rarity: 'legendary', value: { chance: 0.25, mult: 0.75 } }
        ],
        getDescription: (val) => `Crit +${Math.round(val.chance * 100)}% & Multiplier +${val.mult.toFixed(2)}x`,
        apply: (player, val) => {
            player.critChance = Math.min(0.85, player.critChance + val.chance);
            player.critMultiplier += val.mult;
        }
    },
    {
        id: 'charged_shot',
        name: 'Charged Shot',
        tiers: [
            { rarity: 'epic', value: 8 },
            { rarity: 'legendary', value: 6 }
        ],
        getDescription: (val) => `Every ${val}s: massive charged projectile`,
        apply: (player, val) => {
            player.chargedShotCooldownFrames = Math.max(1, val * 60);
            player.chargedShotTimer = 0;
        }
    },
    {
        id: 'cyclic_shield',
        name: 'Cyclic Shield',
        tiers: [
            { rarity: 'rare', value: 25 },
            { rarity: 'epic', value: 18 },
            { rarity: 'legendary', value: 12 }
        ],
        getDescription: (val) => `Absorb 1 hit, recharge every ${val}s`,
        apply: (player, val) => {
            player.shieldCooldownFrames = val * 60;
            player.hasShield = true;
            player.shieldTimer = 0;
        }
    },
    {
        id: 'light_vampirism',
        name: 'Light Vampirism',
        tiers: [
            { rarity: 'rare', value: 14 },
            { rarity: 'epic', value: 10 }
        ],
        getDescription: (val) => `Heal 1 HP every ${val} kills`,
        apply: (player, val) => {
            player.lifeStealKillsRequired = val;
            player.lifeStealCounter = 0;
        }
    },
    {
        id: 'iframes',
        name: 'i-frames',
        tiers: [
            { rarity: 'uncommon', value: 30 },
            { rarity: 'rare', value: 45 },
            { rarity: 'epic', value: 60 }
        ],
        getDescription: (val) => `Invulnerable ${Math.round((val / 60) * 10) / 10}s after hit`,
        apply: (player, val) => { player.invulnDurationFrames = Math.max(player.invulnDurationFrames, val); }
    },
    {
        id: 'slow_on_hit',
        name: 'Slow on Hit',
        tiers: [
            { rarity: 'uncommon', value: 0.2 },
            { rarity: 'rare', value: 0.3 },
            { rarity: 'epic', value: 0.4 }
        ],
        getDescription: (val) => `Enemies hit are slowed by ${Math.round(val * 100)}%`,
        apply: (player, val) => { player.slowOnHit = Math.max(player.slowOnHit, val); }
    },
    {
        id: 'wave_economy',
        name: 'Wave Economy',
        bossWaveOnly: true,
        tiers: [{ rarity: 'rare', value: 1 }],
        getDescription: () => '+1 reroll in boss upgrade rewards',
        apply: (player) => { player.upgradeRerolls += 1; }
    },
    {
        id: 'mad_buyer',
        name: 'Mad Buyer',
        bossWaveOnly: true,
        tiers: [{ rarity: 'epic', value: 1 }],
        getDescription: () => '+1 choice in boss upgrade rewards',
        apply: (player) => { player.upgradeChoicesBonus += 1; }
    }
];

class UpgradeManager {
    static getRandomRarity(allowedRarityIds) {
        const allowed = RARITIES.filter(r => allowedRarityIds.includes(r.id));
        const totalWeight = allowed.reduce((sum, r) => sum + r.weight, 0);
        let random = Math.random() * totalWeight;

        for (const rarity of allowed) {
            random -= rarity.weight;
            if (random <= 0) return rarity;
        }
        return allowed[0]; // Fallback
    }

    static getRandomUpgrades(count = 3, options = {}) {
        const { wasBossWave = false } = options;
        const eligibleTypes = UPGRADE_TYPES.filter(type => !type.bossWaveOnly || wasBossWave);
        const shuffledTypes = [...eligibleTypes].sort(() => 0.5 - Math.random());
        const selectedTypes = shuffledTypes.slice(0, count);

        return selectedTypes.map(type => {
            const allowedRarityIds = type.tiers.map(tier => tier.rarity);
            const rarity = this.getRandomRarity(allowedRarityIds);
            const rarityIndex = RARITY_ORDER.indexOf(rarity.id);
            let chosenTier = type.tiers[0];
            for (const tier of type.tiers) {
                const tierIndex = RARITY_ORDER.indexOf(tier.rarity);
                if (tierIndex <= rarityIndex) {
                    chosenTier = tier;
                }
            }
            const value = chosenTier.value;

            return {
                id: type.id,
                name: type.name,
                rarity: getRarityById(chosenTier.rarity),
                value: value,
                description: type.getDescription(value),
                apply: (player) => type.apply(player, value)
            };
        });
    }
}
