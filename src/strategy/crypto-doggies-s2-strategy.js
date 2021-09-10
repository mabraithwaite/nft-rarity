import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class CryptoDoggiesS2Strategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            breed: { path: ['composition', 'breed'] },
            luck: { path: ['composition', 'luck'] },
            rarity: { path: ['composition', 'rarity'] },
            body: { iterable: true, path: ['composition', 'body'] },
            body_cnt: {
                customStatsMapper: (item) => {
                    return [item.composition.body.length];
                },
                customProbsMapper: (item, stats) => {
                    return [stats[item.composition.body.length]];
                }
            },
            traits: { iterable: true, path: ['composition', 'traits'] },
            traits_cnt: {
                customStatsMapper: (item) => {
                    return [item.composition.traits.length];
                },
                customProbsMapper: (item, stats) => {
                    return [stats[item.composition.traits.length]];
                }
            },
        };
        this.fillIterableTraits(items, keys);
        return keys;
    }

    extractId(item) {
        return (item.id + '').padStart(4, '0');
    }

    async getItems() {
        const jsonStr = fs.readFileSync('./cache/season2_cryptodoggies.json', 'utf-8');
        return Object.values(
            JSON.parse(jsonStr)['721']['e35a1412a23b10bab24f750a88c65aaae4ab3748863b78aeebcbb4c8']
        );
    }

    getName() {
        return 'doggies-s2';
    }
}