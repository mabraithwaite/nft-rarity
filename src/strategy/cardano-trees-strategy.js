import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class CardanoTreesStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            Abundance: { iterable: false, path: ['Abundance'] },
            Environment: { iterable: false, path: ['Environment'] },
            Flowers: { iterable: false, path: ['Flowers'] },
            Fruits: { iterable: false, path: ['Fruits'] },
            Lat: { iterable: false, path: ['Lat'] },
            Long: { iterable: false, path: ['Long'] },
            NofTrees: { iterable: false, path: ['NofTrees'] },
            TreeSpecies: { iterable: false, path: ['TreeSpecies'] },
            Country: { iterable: false, path: ['Country'] }
        };
        return keys;
    }

    extractId(item) {
        return item.AssetName;
    }

    getName() {
        return 'trees';
    }

    getPolicyId() {
        return 'e09e4f4217669b7f735b7a3724e835d8d6344db128eb03d6ea72885e';
    }
}
