# uiuc-food
This project is a data exploration of restaurants, cafes, etc. in the UIUC extended campus. The project was inspired by attempting to eat at all the eateries local to the Champaign-Urbana area while attending the University of Illinois. The visualization was inspired by one of Professor Wade Fagen-Ulmschneider's data discoveries: Every Gen Ed at UIUC, by GPA.

## Dataset
The dataset used for the visualization portion of this project can be found at `visualization/res/dataset.json`. The dataset used for this project was compiled through the use of webscraping for eatery names and addresses, geocoding to convert the addresses to coordinates, and using the Zomato API to obtain price and rating information. The dataset was filtered by removing fast food eateries by cross checking a separate dataset of American fast food chains and then further filtered by checking whether an eatery fell in the bounds defined as UIUC campus and extended campus. UIUC campus and extended campus were defined via the creation of polygons in Google My Maps, accounting for Campustown, Downtown Champaign, etc. Bounds checking was accomplished by exporting a KML file from Google My Maps and then performing point-in-polygon checks.

Files in `data/generated` folder were used for intermediate steps and were manipulated both via scripts and manually. If referencing the dataset used for this project please reference `visualization/res/dataset.json` as mentioned above.

### Notes

If calling `getEateryInformation()` from `lib/eateryInfo.js`, make sure to define the `ZOMATO_USER_KEY` environment variable.

e.g. `$ ZOMATO_USER_KEY=<user-key> node something.js`
