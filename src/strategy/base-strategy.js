import fs from 'fs';
import _ from 'lodash';
import { RankingStrategyType } from './ranking-strategy-type.js';

export class BaseStrategy {
    constructor(SALT_KEY) {
        this.SALT_KEY = SALT_KEY;
        if (this.constructor == BaseStrategy) {
            throw new Error("BaseStrategy is an abstract class and can't be instantiated.");
        }
    }

    fillIterableTraits(items, keyConfigs) {
        items.forEach((item) => {
            Object.keys(keyConfigs)
                .filter((key) => keyConfigs[key].iterable)
                .forEach((key) => {
                    const keyConfig = keyConfigs[key];
                    const traitSet = keyConfig.traits || new Set();
                    keyConfig.traits = traitSet;
                    const iterable = _.get(item, keyConfig.path);
                    iterable.forEach((trait) => {
                        traitSet.add(Object.keys(trait)[0]);
                    });
                });
        });
        Object.keys(keyConfigs)
            .filter((key) => keyConfigs[key].iterable)
            .forEach((key) => {
                const keyConfig = keyConfigs[key];
                keyConfig.traits = [...keyConfig.traits];
            });
        return keyConfigs;
    }

    makeKeys() {
        throw new Error('makeKeys() has not been implemented.');
    }

    getStatsForKeys(items, keys) {
        const stats = {};
        items.forEach((item) => {
            Object.keys(keys).forEach((key) => {
                const keyConfig = keys[key];
                const statsBody = stats[key] || {};
                stats[key] = statsBody;
                if (keyConfig.iterable) {
                    keyConfig.traits.forEach((trait) => {
                        const traitsBody = statsBody[trait] || {};
                        statsBody[trait] = traitsBody;
                        const value = _.get(item, keyConfig.path).find((v) => v[trait]);
                        if (value) {
                            traitsBody[value[trait]] = (traitsBody[value[trait]] || 0) + 1;
                        } else {
                            traitsBody[this.SALT_KEY] = (traitsBody[this.SALT_KEY] || 0) + 1;
                        }
                    });
                } else if (keyConfig.customStatsMapper) {
                    const stats = keyConfig.customStatsMapper(item);
                    if (stats && stats.length) {
                        stats.forEach((stat) => {
                            statsBody[stat] = (statsBody[stat] || 0) + 1;
                        });
                    } else if (stats) {
                        statsBody[this.SALT_KEY] = (statsBody[this.SALT_KEY] || 0) + 1;
                    }
                } else {
                    const value = _.get(item, keyConfig.path);
                    if (value) {
                        statsBody[value] = (statsBody[value] || 0) + 1;
                    } else {
                        statsBody[this.SALT_KEY] = (statsBody[this.SALT_KEY] || 0) + 1;
                    }
                }
            });
        });
        return stats;
    }

    getItemScoreFromStats(items, keys, stats, strat = RankingStrategyType.STATISTICAL) {
        const probs = new Array(items.length).fill(0);
        const statStrat = strat === RankingStrategyType.STATISTICAL;
        items.forEach((item, index) => {
            let prob = statStrat ? 1 : 0;
            Object.keys(keys).forEach((key) => {
                const keyConfig = keys[key];
                const statsBody = stats[key] || {};
                if (keyConfig.iterable) {
                    keyConfig.traits.forEach((trait) => {
                        const traitsBody = statsBody[trait] || {};
                        const value = _.get(item, keyConfig.path).find((v) => v[trait]);
                        if (value) {
                            if (statStrat) {
                                prob *= traitsBody[value[trait]] / items.length;
                            } else {
                                prob += items.length / traitsBody[value[trait]];
                            }
                        } else {
                            if (statStrat) {
                                prob *= traitsBody[this.SALT_KEY] / items.length;
                            } else {
                                prob += items.length / traitsBody[this.SALT_KEY];
                            }
                        }
                    });
                } else if (keyConfig.customProbsMapper) {
                    const probValues = keyConfig.customProbsMapper(item, statsBody);
                    if (probValues && probValues.length) {
                        probValues.forEach((count) => {
                            if (statStrat) {
                                prob *= count / items.length;
                            } else {
                                prob += items.length / count;
                            }
                        });
                    } else if (probValues) {
                        if (statStrat) {
                            prob *= statsBody[this.SALT_KEY] / items.length;
                        } else {
                            prob += items.length / statsBody[this.SALT_KEY];
                        }
                    }
                } else {
                    const value = _.get(item, keyConfig.path);
                    if (value) {
                        if (statStrat) {
                            prob *= statsBody[value] / items.length;
                        } else {
                            prob += items.length / statsBody[value];
                        }
                    } else {
                        if (statStrat) {
                            prob *= statsBody[this.SALT_KEY] / items.length;
                        } else {
                            prob += items.length / statsBody[this.SALT_KEY];
                        }
                    }
                }
            });
            probs[index] = { id: this.extractId(item), prob };
        });
        if (statStrat) {
            probs.sort((a, b) => a.prob - b.prob);
        } else {
            probs.sort((a, b) => b.prob - a.prob);
        }
        return probs;
    }

    extractId(item) {
        throw new Error('extractId() has not been implemented.');
    }

    async getItems(itemQueryStrategy) {
        const cacheFileName = `./cache/${this.getName()}-cache.json`;
        let items;
        if (!fs.existsSync(cacheFileName)) {
            console.log(`${cacheFileName} file not found, caching items...`);
            items = await itemQueryStrategy.getItems(this.getPolicyId());
            fs.writeFileSync(cacheFileName, JSON.stringify(items), 'utf-8');
        } else {
            items = JSON.parse(fs.readFileSync(cacheFileName, 'utf-8'));
        }
        return items;
    }

    getName() {
        throw new Error('getName() has not been implemented.');
    }

    getPolicyId() {
        throw new Error('getPolicyId() has not been implemented.');
    }
}
