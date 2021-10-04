import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class CryptoDoggiesS2Strategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            breed: { path: ['composition', 'breed'] },
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
            }
        };
        this.fillIterableTraits(items, keys);
        return keys;
    }

    extractId(item) {
        return (item.id + '').padStart(4, '0');
    }

    getName() {
        return 'doggies-s2';
    }

    getPolicyId() {
        return 'e35a1412a23b10bab24f750a88c65aaae4ab3748863b78aeebcbb4c8';
    }
}
