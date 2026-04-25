const RARITIES = [
    { id: 'common', name: 'Common', color: '#ffffff', weight: 64 },
    { id: 'uncommon', name: 'Uncommon', color: '#2ecc71', weight: 20 },
    { id: 'rare', name: 'Rare', color: '#3498db', weight: 10 },
    { id: 'epic', name: 'Epic', color: '#9b59b6', weight: 5 },
    { id: 'legendary', name: 'Legendary', color: '#e67e22', weight: 1 }
];

const RARITY_ORDER = RARITIES.map(r => r.id);
const getRarityById = (id) => RARITIES.find(r => r.id === id);
const UPGRADE_REWARD_TYPES = {
    CLASSIC: 'classic',
    UNIQUE: 'unique'
};
const MIN_UNIQUE_RARITY_INDEX = RARITY_ORDER.indexOf('uncommon');

const UPGRADE_TYPES = [
    {
        id: 'damage_up',
        name: 'Damage',
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
        tiers: [
            { rarity: 'common', value: 5 },
            { rarity: 'uncommon', value: 8 },
            { rarity: 'rare', value: 12 },
            { rarity: 'epic', value: 18 },
            { rarity: 'legendary', value: 25 }
        ],
        getDescription: (val) => `Projectile Damage +${val}`,
        apply: (player, val) => { player.projectileDamage += val; }
    },
    {
        id: 'fire_rate_up',
        name: 'Fire Rate',
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
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
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
        tiers: [
            { rarity: 'rare', value: 1 },
            { rarity: 'epic', value: 2 },
            { rarity: 'legendary', value: 3 }
        ],
        getDescription: (val) => `Projectiles +${val}`,
        apply: (player, val) => { player.projectileCount += val; }
    },
    {
        id: 'heal',
        name: 'Vitality',
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
        tiers: [
            { rarity: 'rare', value: 1 },
            { rarity: 'epic', value: 2 },
            { rarity: 'legendary', value: 3 }
        ],
        getDescription: (val) => `Gain +${val} Max HP`,
        apply: (player, val) => {
            player.maxHp += val;
            player.hp += val;
        }
    },
    {
        id: 'speed_up',
        name: 'Speed',
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
        tiers: [
            { rarity: 'common', value: 0.2 },
            { rarity: 'uncommon', value: 0.4 },
            { rarity: 'rare', value: 0.8 },
            { rarity: 'epic', value: 1.3 },
            { rarity: 'legendary', value: 2 }
        ],
        getDescription: (val) => `Movement Speed +${Math.round((val / 2) * 100)}%`,
        apply: (player, val) => { player.speed += val; }
    },
    {
        id: 'pierce_rounds',
        name: 'Pierce',
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
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
        rewardType: UPGRADE_REWARD_TYPES.UNIQUE,
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
        rewardType: UPGRADE_REWARD_TYPES.UNIQUE,
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
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
        tiers: [
            { rarity: 'common', value: 20 },
            { rarity: 'uncommon', value: 13 },
            { rarity: 'rare', value: 8 },
            { rarity: 'epic', value: 4 },
            { rarity: 'legendary', value: 2 }
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
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
        tiers: [
            { rarity: 'common', value: 50 },
            { rarity: 'uncommon', value: 35 },
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
        id: 'vampirism',
        name: 'Vampirism',
        rewardType: UPGRADE_REWARD_TYPES.UNIQUE,
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
        id: 'slow_on_hit',
        name: 'Slow on Hit',
        rewardType: UPGRADE_REWARD_TYPES.CLASSIC,
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
        rewardType: UPGRADE_REWARD_TYPES.UNIQUE,
        tiers: [{ rarity: 'rare', value: 1 }],
        getDescription: () => '+1 reroll in upgrade rewards',
        apply: (player) => { player.upgradeRerolls += 1; }
    },
    {
        id: 'mad_buyer',
        name: 'Mad Buyer',
        rewardType: UPGRADE_REWARD_TYPES.UNIQUE,
        tiers: [{ rarity: 'epic', value: 1 }],
        getDescription: () => '+1 choice in upgrade rewards',
        apply: (player) => { player.upgradeChoicesBonus += 1; }
    }
];

const isUniqueUpgradeValid = (upgradeType) => {
    if (upgradeType.rewardType !== UPGRADE_REWARD_TYPES.UNIQUE) return true;
    return upgradeType.tiers.every((tier) => RARITY_ORDER.indexOf(tier.rarity) >= MIN_UNIQUE_RARITY_INDEX);
};

if (!UPGRADE_TYPES.every((type) => type.rewardType === UPGRADE_REWARD_TYPES.CLASSIC || type.rewardType === UPGRADE_REWARD_TYPES.UNIQUE)) {
    throw new Error('Each upgrade must belong to exactly one reward type: classic or unique.');
}

if (!UPGRADE_TYPES.every(isUniqueUpgradeValid)) {
    throw new Error('Unique upgrades must be at least uncommon rarity.');
}

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
        const targetRewardType = wasBossWave ? UPGRADE_REWARD_TYPES.UNIQUE : UPGRADE_REWARD_TYPES.CLASSIC;
        const eligibleTypes = UPGRADE_TYPES.filter((type) => type.rewardType === targetRewardType);
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
