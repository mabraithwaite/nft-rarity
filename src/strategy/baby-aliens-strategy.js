import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

const traits = ['accessory', 'clothes', 'hat'];

export class BabyAliensStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            accessory: { path: ['accessory'] },
            background: { path: ['background'] },
            body: { path: ['body'] },
            clothes: { path: ['clothes'] },
            eyes: { path: ['eyes'] },
            face: { path: ['face'] },
            hat: { path: ['hat'] },
            mouth: { path: ['mouth'] },
            trait_count: {
                customStatsMapper: (item) => {
                    return [Object.keys(item).filter(k => traits.includes(k) && item[k] !== 'None').length];
                },
                customProbsMapper: (item, stats) => {
                    return [stats[Object.keys(item).filter(k => traits.includes(k)).length]];
                }
            }
        };
        return keys;
    }

    extractId(item) {
        return item.name.replace('BabyAlien', '');
    }

    getName() {
        return 'baby-aliens';
    }

    getPolicyId() {
        return '15509d4cb60f066ca4c7e982d764d6ceb4324cb33776d1711da1beee';
    }
}
