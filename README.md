Hacked together scripts to rank nft items relative to their collection. There are a couple different strategies implemented:
- STATISTICAL: Calculates the distribution of different traits for the collection, then calculates the probability that a specific nft was generated with the traits it has. Lower probability is considered more rare.
- RARITY: This is based off the blog post found here: https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c

  The example given in the article is implemented here in `MockStrategy` to show it gets the same results suggested in the article.

**DISCLAIMER**: I'm not a mathematician, just a coder and wanted a way I could rank projects I was getting into. If you're making purchasing decisions off my calculations, shame on you, and no coming after me if you lose money. As they say, I'm not a financial advisor.