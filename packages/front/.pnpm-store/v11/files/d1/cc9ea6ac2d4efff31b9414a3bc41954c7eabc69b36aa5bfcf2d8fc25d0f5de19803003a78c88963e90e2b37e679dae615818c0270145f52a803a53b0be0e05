var fs = require('fs');

var request = require('superagent');
var cheerio = require('cheerio');

var map = {};

request.get('http://unicode.org/charts/charindex.html')
.end(function(res) {
  var $ = cheerio.load(res.text);

 $('a[href*=pdf]').each(function() {
   var code = String.fromCharCode(parseInt($(this).text(), 16));
   var character_title = $(this).parent().prev().text();
   var character = character_title.charAt(0);

   // Check if the title is describing a character
   var isACharacter = character_title.charAt(1) === ' ' || character_title.charAt(1) === ',';
  
   // check if the character is already a standard ascii char
   var isAscii = code.toUpperCase().charCodeAt(0) >= 65 && code.toUpperCase().charCodeAt(0) <= 90;

   if(isACharacter && !isAscii) {
    map[code.toUpperCase().charCodeAt(0)] = character.toUpperCase();
    map[(code.toLowerCase()).charCodeAt(0)] = character.toLowerCase();
   }
 });

 fs.writeFile('../charmap.json', JSON.stringify(map), function (err) {
    if (err) return console.log(err);
    console.log('charmap.json created!');
  });


});




