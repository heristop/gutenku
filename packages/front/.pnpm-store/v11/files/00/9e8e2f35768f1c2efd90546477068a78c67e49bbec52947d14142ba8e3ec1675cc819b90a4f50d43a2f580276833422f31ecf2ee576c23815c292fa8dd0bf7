var characters_map = require('../charmap.json');


var assert = require('assert');
var normalize = require('../index');

function test_default_charmap() {
  var special_characters = Object.keys(characters_map);

  var characters_array = Object.keys(characters_map).map(function(key) {
   return characters_map[key];
  });

  special_characters.forEach(function(value, index) {
    var special_char = String.fromCharCode(value);
    assert(normalize(special_char) === characters_array[index], 'The character ' + special_char + ' was normalized');
  });
}

function test_custom_charmap() {
  var custom_map = {
   '97': 'E',
   '98': 'Z'
 };

 assert(normalize('aabb', custom_map) === 'EEZZ', 'Normalize with custom map');
}

console.time('duration');
test_default_charmap();
console.timeEnd('duration');

console.time('duration');
test_custom_charmap();
console.timeEnd('duration');
