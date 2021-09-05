import csv from 'csv-parser';
import fs from 'fs';
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

    async getItems() {
        return await new Promise((resolve, reject) => {
            let items = [];
            fs.createReadStream('./cache/cardano-trees.csv')
                .pipe(csv())
                .on('data', (data) => items.push(data))
                .on('end', () => {
                    resolve(items);
                });
        });
    }

    getName() {
        return 'trees';
    }
}
