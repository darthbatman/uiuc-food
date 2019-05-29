# uiuc-food
Data exploration of restaurants, cafes, etc. in the UIUC extended campus.

Dataset: `visualization/res/dataset.json`

Files in `data/generated` folder were used for intermediate steps and were manipulated both via scripts and manually. If referencing the dataset used for this project please reference `visualization/res/dataset.json` as mentioned above.

Note: If calling `getEateryInformation()` from `lib/eateryInfo.js`, make sure to define the `ZOMATO_USER_KEY` environment variable.

e.g. `$ ZOMATO_USER_KEY=<user-key> node something.js`