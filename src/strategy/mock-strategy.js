import csv from 'csv-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class MockStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            trait1: { iterable: false, path: ['trait1'] },
            trait2: { iterable: false, path: ['trait2'] },
            trait3: { iterable: false, path: ['trait3'] },
            trait4: { iterable: false, path: ['trait4'] },
            trait5: { iterable: false, path: ['trait5'] }
        };
        return keys;
    }

    extractId(item) {
        return item.id;
    }

    async getItems() {
        return await new Promise((resolve, reject) => {
            let items = [];
            fs.createReadStream('./cache/mock.csv')
                .pipe(csv())
                .on('data', (data) => items.push(data))
                .on('end', () => {
                    resolve(items);
                });
        });
    }

    getName() {
        return 'mock';
    }
}
