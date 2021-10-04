import fs from 'fs';
import _ from 'lodash';
import { DateTime } from 'luxon';
import minimist from 'minimist';
import { BlockfrostItemQueryStrategy } from './item-query-strategy/blockfrost-item-query-strategy.js';
import { CardanoTreesStrategy } from './strategy/cardano-trees-strategy.js';
import { ClayNationStrategy } from './strategy/clay-nation-strategy.js';
import { CryptoDoggiesS1Strategy } from './strategy/crypto-doggies-s1-strategy.js';
import { CryptoDoggiesS2Strategy } from './strategy/crypto-doggies-s2-strategy.js';
import { MockStrategy } from './strategy/mock-strategy.js';
import { RankingStrategyType } from './strategy/ranking-strategy-type.js';
import { SpaceBudzStrategy } from './strategy/space-budz-strategy.js';
import { UnsigsStrategy } from './strategy/unsigs-strategy.js';
import { YummiStrategy } from './strategy/yummi-strategy.js';

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

    const rankStratTypes = getRankingStrategyType(args);
    console.log('Using rank strategy types:', rankStratTypes);
    const strategy = getCollectionStrategy(args);
    console.log('Using collection strategy:', strategy.getName());
    const itemQueryStrategy = getItemQueryStrategy(args);
    console.log('Using item query strategy:', itemQueryStrategy.getName());
    const items = await strategy.getItems(itemQueryStrategy);
    console.log('Item count from strategy:', items.length);

    const keys = strategy.makeKeys(items);
    const stats = strategy.getStatsForKeys(items, keys);

    for (const rankStratType of rankStratTypes) {
        const probs = strategy.getItemScoreFromStats(items, keys, stats, rankStratType);
        writeToCsv(probs, `${strategy.getName()}-${rankStratType}`);
    }

    const end = DateTime.now();
    console.log('end:', end.toString());
    console.log('duration:', end.diff(start, ['minutes', 'seconds']).toObject());
}

const strategyList = _.keyBy(
    [
        new CryptoDoggiesS1Strategy(),
        new CryptoDoggiesS2Strategy(),
        new CardanoTreesStrategy(),
        new UnsigsStrategy(),
        new ClayNationStrategy(),
        new SpaceBudzStrategy(),
        new YummiStrategy(),
        new MockStrategy()
    ],
    (strat) => strat.getName()
);

function getCollectionStrategy(args) {
    return (args.nft && strategyList[args.nft]) || strategyList['mock'];
}

const itemQueryStrategyList = _.keyBy(
    [new BlockfrostItemQueryStrategy()],
    (strat) => strat.getName()
);

function getItemQueryStrategy(args) {
    return (
        (args.queryStrat && itemQueryStrategyList[args.queryStrat]) ||
        itemQueryStrategyList['blockfrost']
    );
}

function getRankingStrategyType(args) {
    const strat = (args.strat || 'all').toLowerCase().trim();
    const strats = Object.values(RankingStrategyType);
    if (strat === 'all') return strats;
    if (!strats.includes(strat)) throw new Error(`Strategy "${strat}" doesn't exist`);
    return [strat];
}

main();
