## Overview

Hacked together scripts to rank nft items relative to their collection. There are a couple different strategies implemented:
- STATISTICAL: Calculates the distribution of different traits for the collection, then calculates the probability that a specific nft was generated with the traits it has. Lower probability is considered more rare.
- RARITY: This is based off the blog post found here: https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c

  The example given in the article is implemented here in `MockStrategy` to show it gets the same results suggested in the article.

## Usage:

Currently, the app pulls collection data from https://blockfrost.io/. To run the app, you'll need to get an api key and add it to `environment.js`.

To run on a specific project, you'll need the projects "name" provided in that projects strategy. You can pass the name with the parameter `--nft`. Ex:
```
npm run -- --nft=space-budz
```

By default, this will run both ranking strategies. To run a specific strategy, you can use the parameter `--strat`. Ex:

```
npm run -- --nft=space-budz --strat=rarity
npm run -- --nft=space-budz --strat=statistical
```

On the first run, collection data will be pulled from blockfrost, but will then be cached in `.json` on your machine. To re-pull (maybe more assets were minted), you'll need to delete the cached file in `cache/`.

## Disclaimer
I'm not a mathematician, just a coder and wanted a way I could rank projects I was getting into. If you're making purchasing decisions off my calculations, shame on you, and no coming after me if you lose money. As they say, I'm not a financial advisor.