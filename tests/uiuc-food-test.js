var fs = require('fs');

var uiucFood = require('../uiuc-food.js');

uiucFood.getEateries(function(eateries) {
    fs.writeFileSync('eateries.json', JSON.stringify(eateries, null, 4));
});