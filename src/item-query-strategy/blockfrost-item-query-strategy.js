import logUpdate from 'log-update';
import fetch from 'node-fetch';
import environment from '../../environment.js';
import { retryPromise } from '../helper/retry-helper.js';
import { BaseItemQueryStrategy } from './base-item-query-strategy.js';

const headers = {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    project_id: environment.blockfrostApiKey
};

const MAX_ASSET_CALLS = 10;
const MAX_RETRIES = 3;

export class BlockfrostItemQueryStrategy extends BaseItemQueryStrategy {
    getName() {
        return 'blockfrost';
    }

    async getItems(policyId) {
        const policyDetails = await this.gatherAllPolicyDetails(policyId);
        const items = await this.gatherAllItems(policyDetails);
        console.log('Total tokens found:', items.length);
        return items;
    }

    async gatherAllPolicyDetails(policyId) {
        const policyDetails = [];
        let lastResults = [];
        let currentResults = [];
        let page = 1;
        do {
            logUpdate('Details page =', page, 'Total details =', policyDetails.length);
            lastResults = currentResults;
            currentResults = await this.getPolicyDetailsPromise(page, policyId);
            page++;
            policyDetails.push(...currentResults);
        } while (currentResults.length >= lastResults.length);
        logUpdate.done();
        logUpdate('Total details =', policyDetails.length);
        logUpdate.done();
        return policyDetails;
    }

    async gatherAllItems(policyDetails) {
        const items = [];
        for (let i = 0; i < policyDetails.length; i += MAX_ASSET_CALLS) {
            logUpdate('Item detail batch =', i + 1, '-', i + MAX_ASSET_CALLS);
            const arrSize =
                i + MAX_ASSET_CALLS < policyDetails.length
                    ? MAX_ASSET_CALLS
                    : MAX_ASSET_CALLS - (i + MAX_ASSET_CALLS - policyDetails.length);
            items.push(
                ...(
                    await Promise.all(
                        new Array(arrSize)
                            .fill(0)
                            .map((_, sIndex) =>
                                this.getAssetDetailsPromise(policyDetails[i + sIndex].asset)
                            )
                    )
                )
                    .filter((v) => v.onchain_metadata)
                    .map((v) => v.onchain_metadata)
            );
        }
        logUpdate.done();
        return items;
    }

    getPolicyDetailsPromise(page, policyId) {
        return retryPromise(
            () =>
                fetch(
                    `https://cardano-mainnet.blockfrost.io/api/v0/assets/policy/${policyId}?page=${page}`,
                    { headers }
                ).then((res) => res.json()),
            (count) =>
                console.log(
                    `retrying getPolicyDetailsPromise() page=${page} policyId=${policyId} retries=${count}`
                )
        );
    }

    getAssetDetailsPromise(assetId) {
        return retryPromise(
            () =>
                fetch(`https://cardano-mainnet.blockfrost.io/api/v0/assets/${assetId}`, {
                    headers
                }).then((res) => res.json()),
            (count) =>
                console.log(`retrying getAssetDetailsPromise() assetId=${assetId} retries=${count}`)
        );
    }
}
