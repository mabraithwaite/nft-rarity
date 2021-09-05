import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class CryptoDoggiesStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            breed: { iterable: false, path: ['breed'] },
            body: { iterable: true, path: ['composition', 'body'] },
            setting: { iterable: true, path: ['composition', 'setting'] },
            traits: { iterable: true, path: ['composition', 'traits'] }
        };
        this.fillIterableTraits(items, keys);
        return keys;
    }

    extractId(item) {
        return item.id;
    }

    async getItems() {
        // const jsonStr = fs.readFileSync('./cache/crypto-doggies.json', 'utf-8');
        // return JSON.parse(jsonStr);
        const jsonStr = fs.readFileSync('./cache/season1_cryptodoggies.json', 'utf-8');
        return Object.values(
            JSON.parse(jsonStr)['721']['7724da6519bbdda506e4d8acce11e01e01019726ddf017418f9c958a']
        );
    }

    getName() {
        return 'doggies';
    }
}
