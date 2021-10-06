import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class UnsigsStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            num_props: { path: ['unsigs', 'num_props'] },
            properties: {
                customStatsMapper: (item) => {
                    const stats = [];
                    if(!item.unsigs) return null;
                    for (let i = 0; i < item.unsigs.num_props; ++i) {
                        stats.push(
                            buildKey(
                                item.unsigs.properties.multipliers[i],
                                item.unsigs.properties.colors[i],
                                item.unsigs.properties.distributions[i],
                                item.unsigs.properties.rotations[i]
                            )
                        );
                    }
                    return stats.length ? stats : null;
                },
                customProbsMapper: (item, stats) => {
                    const counts = [];
                    if(!item.unsigs) return null;
                    for (let i = 0; i < item.unsigs.num_props; ++i) {
                        counts.push(
                            stats[
                                buildKey(
                                    item.unsigs.properties.multipliers[i],
                                    item.unsigs.properties.colors[i],
                                    item.unsigs.properties.distributions[i],
                                    item.unsigs.properties.rotations[i]
                                )
                            ]
                        );
                    }
                    return counts.length ? counts : null;
                }
            }
        };
        return keys;
    }

    extractId(item) {
        return item.title.replace('unsig_', '');
    }

    getName() {
        return 'unsigs';
    }

    getPolicyId() {
        return '0e14267a8020229adc0184dd25fa3174c3f7d6caadcb4425c70e7c04';
    }
}

function buildKey(multiplier, color, distribution, rotation) {
    return `${multiplier}_${color}_${distribution}_${rotation}`;
}
