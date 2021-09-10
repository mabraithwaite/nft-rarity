import fs from 'fs';
import { DateTime } from 'luxon';
import minimist from 'minimist';
import { CardanoTreesStrategy } from './strategy/cardano-trees-strategy.js';
import { CryptoDoggiesS1Strategy } from './strategy/crypto-doggies-s1-strategy.js';
import { CryptoDoggiesS2Strategy } from './strategy/crypto-doggies-s2-strategy.js';
import { MockStrategy } from './strategy/mock-strategy.js';
import { RankingStrategyType } from './strategy/ranking-strategy-type.js';
import { UnsigsStrategy } from './strategy/unsigs-strategy.js';

function writeToCsv(probs, pathPrepend) {
    const path = `./rankings-${pathPrepend}.csv`;
    if (fs.existsSync(path)) {
        console.log('removing file:', path);
        try {
            fs.unlinkSync(path);
        } catch (err) {
            console.error(err);
            return;
        }
    }

    let probIndex = 0;
    const uniqueProbValues = [...new Set(probs.map((p) => p.prob))];

    const writer = fs.createWriteStream(path, {
        flags: 'a'
    });
    writer.write('id,rank,score,% ranked above,tied\n');
    probs.forEach((prob, index) => {
        if (uniqueProbValues[probIndex] !== prob.prob) {
            probIndex++;
        }
        writer.write(
            `'${prob.id},${probIndex + 1},${prob.prob},${
                (((probIndex + 1) / uniqueProbValues.length) * 100).toFixed(2) + '%'
            },${
                (index < probs.length - 1 && probs[index + 1].prob === prob.prob) ||
                (index > 0 && probs[index - 1].prob === prob.prob)
                    ? 'true'
                    : ''
            }\n`
        );
    });

    writer.end();
}

async function main() {
    const start = DateTime.now();
    console.log('start:', start.toString());

    const args = minimist(process.argv.slice(2));

    const rankStratType = getRankingStrategyType(args);
    const strategy = getCollectionStrategy(args);
    const items = await strategy.getItems();

    const keys = strategy.makeKeys(items);
    const stats = strategy.getStatsForKeys(items, keys);
    const probs = strategy.getItemScoreFromStats(items, keys, stats, rankStratType);

    writeToCsv(
        probs,
        `${strategy.getName()}-${
            rankStratType === RankingStrategyType.STATISTICAL ? 'stat' : 'rarity'
        }`
    );

    const end = DateTime.now();
    console.log('end:', end.toString());
    console.log('duration:', end.diff(start, ['minutes', 'seconds']).toObject());
}

function getCollectionStrategy(args) {
    const value = args.nft || 'mock';
    switch (value) {
        case 'doggies-s1':
            return new CryptoDoggiesS1Strategy();
        case 'doggies-s2':
            return new CryptoDoggiesS2Strategy();
        case 'trees':
            return new CardanoTreesStrategy();
        case 'unsigs':
            return new UnsigsStrategy();
        case 'mock':
        default:
            return new MockStrategy();
    }
}

function getRankingStrategyType(args) {
    return args.strat === 'rarity' ? RankingStrategyType.RARITY : RankingStrategyType.STATISTICAL;
}

main();
