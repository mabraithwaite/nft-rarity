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
                if (!keyConfig.iterable) {
                    const statsBody = stats[key] || {};
                    stats[key] = statsBody;
                    const value = _.get(item, keyConfig.path);
                    if (value) {
                        statsBody[value] = (statsBody[value] || 0) + 1;
                    } else {
                        statsBody[this.SALT_KEY] = (statsBody[this.SALT_KEY] || 0) + 1;
                    }
                } else {
                    keyConfig.traits.forEach((trait) => {
                        const statsBody = stats[key] || {};
                        const traitsBody = statsBody[trait] || {};
                        statsBody[trait] = traitsBody;
                        stats[key] = statsBody;
                        const value = _.get(item, keyConfig.path).find((v) => v[trait]);
                        if (value) {
                            traitsBody[value[trait]] = (traitsBody[value[trait]] || 0) + 1;
                        } else {
                            traitsBody[this.SALT_KEY] = (traitsBody[this.SALT_KEY] || 0) + 1;
                        }
                    });
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
                if (!keyConfig.iterable) {
                    const statsBody = stats[key];
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
                } else {
                    keyConfig.traits.forEach((trait) => {
                        const statsBody = stats[key] || {};
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

    async getItems() {
        throw new Error('getItems() has not been implemented.');
    }

    getName() {
        throw new Error('getName() has not been implemented.');
    }
}
