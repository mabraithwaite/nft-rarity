import { v4 as uuidv4 } from 'uuid';
import { BaseStrategy } from './base-strategy.js';

export class YummiStrategy extends BaseStrategy {
    constructor() {
        super(uuidv4());
    }

    makeKeys(items) {
        const keys = {
            Background: { path: ['attributes', 'Background'] },
            Body: { path: ['attributes', 'Body'] },
            Face: { path: ['attributes', 'Face'] },
            Headwear: { path: ['attributes', 'Headwear'] }
        };
        return keys;
    }

    extractId(item) {
        return item.name.replace('Yummi Universe - Naru ', '');
    }

    getName() {
        return 'yummi';
    }

    getPolicyId() {
        return 'b1814c6d3b0f7a42c9ee990c06c9d504a42bb22bf0e34e7908ae21b2';
    }
}
