var fs = require('fs');

var uiucFood = require('../uiuc-food.js');

uiucFood.getEateries(0, 1000, function(eateries) {
    fs.writeFileSync('eateries.json', JSON.stringify(eateries, null, 4));
});