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
        const cacheFileName = './cache/mock-cache.json';
        if (!fs.existsSync(cacheFileName)) {
            throw new Error('./cache/mock-cache.json file not found');
        }
        return Object.values(JSON.parse(fs.readFileSync(cacheFileName, 'utf-8')));
    }

    getName() {
        return 'mock';
    }
}
