import fs from 'fs';
import { DateTime } from 'luxon';
import { CryptoDoggiesStrategy } from './strategy/crypto-doggies-strategy.js';
import { RankingStrategyType } from './strategy/ranking-strategy-type.js';

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
            `'${(prob.id + '').padStart(4, '0')},${probIndex + 1},${prob.prob},${
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

    const rankStratType = RankingStrategyType.STATISTICAL;
    const strategy = new CryptoDoggiesStrategy();
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

main();
