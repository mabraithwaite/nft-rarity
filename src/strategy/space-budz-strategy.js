import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class SpaceBudzStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            type: { path: ['type'] },
            traits: {
                customStatsMapper: (item) => {
                    return [...item.traits];
                },
                customProbsMapper: (item, stats) => {
                    return item.traits.map((t) => stats[t]);
                }
            },
            traits_count: {
                customStatsMapper: (item) => {
                    return [item.traits.length];
                },
                customProbsMapper: (item, stats) => {
                    return [stats[item.traits.length]];
                }
            }
        };
        return keys;
    }

    extractId(item) {
        return item.name.replace('SpaceBud #', '');
    }

    getName() {
        return 'space-budz';
    }

    getPolicyId() {
        return 'd5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc';
    }
}
