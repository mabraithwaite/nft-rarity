import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class UnsigsStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            num_props: { path: ['num_props'] },
            properties: {
                customStatsMapper: (item) => {
                    const stats = [];
                    for (let i = 0; i < item.num_props; ++i) {
                        stats.push(
                            buildKey(
                                item.properties.multipliers[i],
                                item.properties.colors[i],
                                item.properties.distributions[i],
                                item.properties.rotations[i]
                            )
                        );
                    }
                    return stats.length ? stats : null;
                },
                customProbsMapper: (item, stats) => {
                    const counts = [];
                    for (let i = 0; i < item.num_props; ++i) {
                        counts.push(
                            stats[
                                buildKey(
                                    item.properties.multipliers[i],
                                    item.properties.colors[i],
                                    item.properties.distributions[i],
                                    item.properties.rotations[i]
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
        return (item.index + '').padStart(5, '0');
    }

    async getItems() {
        return Object.values(JSON.parse(fs.readFileSync('./cache/unsigs.json', 'utf-8')));
    }

    getName() {
        return 'unsigs';
    }
}

function buildKey(multiplier, color, distribution, rotation) {
    return `${multiplier}_${color}_${distribution}_${rotation}`;
}
