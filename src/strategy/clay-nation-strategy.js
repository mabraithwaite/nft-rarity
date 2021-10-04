import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

const consolidate = {
    'Cig Mouth': 'Cig',
    'Joint in Mouth': 'Joint Mouth',
    'Joint in mouth': 'Joint Mouth',
    'Rose in Mouth': 'Rose',
    'Rubber Duck on Tounge': 'Rubber Duck On Tounge',
    'Screaming mouth': 'Screaming',
    'Screaming Mouth': 'Screaming',
    Tounge: 'Tounge Out',
    'Vampire Teeth': 'Vampire Mouth'
};

export class ClayNationStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            body: { path: ['body'] },
            eyes: { path: ['eyes'] },
            brows: { path: ['brows'] },
            mouth: {
                customStatsMapper: (item) => {
                    return [consolidate[item.mouth] || item.mouth];
                },
                customProbsMapper: (item, stats) => {
                    return [stats[consolidate[item.mouth] || item.mouth]];
                }
            },
            clothes: { path: ['clothes'] },
            background: { path: ['background'] },
            accessories: { path: ['accessories'] },
            'hats and hair': { path: ['hats and hair'] },
            wings: { path: ['wings'] }
        };
        return keys;
    }

    extractId(item) {
        return item.name.replace('Clay Nation #', '');
    }

    getName() {
        return 'clay-nation';
    }

    getPolicyId() {
        return '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728';
    }
}
