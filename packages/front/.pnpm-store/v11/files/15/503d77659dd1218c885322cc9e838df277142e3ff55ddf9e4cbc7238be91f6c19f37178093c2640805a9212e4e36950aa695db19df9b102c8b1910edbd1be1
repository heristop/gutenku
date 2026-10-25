# Normalize ![travis](https://travis-ci.org/tehsis/normalize.svg?branch=master)

Normalize a string with utf-8 characters.

# Usage

Download: [normalize.js](https://github.com/tehsis/normalize/blob/master/normalize.js) or [normalize.min.js](https://github.com/tehsis/normalize/blob/master/normalize.min.js)

```
$npm install normalize-strings --save
```

or

```
$bower install normalize-strings --save
```

Just use the string you want to *normalize* as argument

```javascript
console.log(normalize('Åland')) // Aland
```

You can import it as a commonJS module

```javascript
var n = require('normalize-strings');

console.log(n('Åland')) // Aland
```

or as an AMD module

```javascript
define(['normalize'],
function(n) {
  console.log(n('Åland')) // Aland
});
```

# How it works?

Normalize is based on [Django's urlify](https://github.com/django/django/blob/master/django/contrib/admin/static/admin/js/urlify.js#L122) scrapping character's map from [http://unicode.org/charts/charindex.html]

# Why?

JS _compares strings according to the utf-8 code of each character_. This means, for example, that *õ comes after z* (i.e. 'õ' > 'z' === true)
and this causes disasters when sorting strings. With normalize, you can correctly fix this.
Althought you have available `String.prototype.localCompare` which solve it, it is not yet supported on some browsers (i.e. IE10 and below).

# Supported characters in the default charmap

```
i À Á Â Ã Ä Å Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Ø Ù Ú Û Ü Ý à á â ã ä å ç è é ê ë ì í î ï ñ ò ó ô õ ö ø ù ú û ü ý ÿ Ā ā Ă ă Ą ą Ć ć Ĉ ĉ Ċ ċ Č č Ď ď Đ đ Ē ē Ĕ ĕ Ė ė Ę ę Ě ě Ĝ ĝ Ğ ğ Ġ ġ Ģ ģ Ĥ ĥ Ħ ħ Ĩ ĩ Ī ī Ĭ ĭ Į į İ Ĵ ĵ Ķ ķ Ĺ ĺ Ļ ļ Ľ ľ Ŀ ŀ Ł ł Ń ń Ņ ņ Ň ň Ō ō Ŏ ŏ Ő ő Œ œ Ŕ ŕ Ŗ ŗ Ř ř Ś ś Ŝ ŝ Ş ş Š š Ţ ţ Ť ť Ŧ ŧ Ũ ũ Ū ū Ŭ ŭ Ů ů Ű ű Ų ų Ŵ ŵ Ŷ ŷ Ÿ Ź ź Ż ż Ž ž ƀ Ɓ Ƃ ƃ Ɔ Ƈ ƈ Ɖ Ɗ Ƌ ƌ Ǝ Ɛ Ƒ ƒ Ɠ Ɨ Ƙ ƙ ƚ Ɯ Ɲ ƞ Ɵ Ơ ơ Ƥ ƥ Ʀ ƫ Ƭ ƭ Ʈ Ư ư Ʋ Ƴ ƴ Ƶ ƶ Ǎ ǎ Ǐ ǐ Ǒ ǒ Ǔ ǔ ǝ Ǥ ǥ Ǧ ǧ Ǩ ǩ Ǫ ǫ Ǵ ǵ Ǹ ǹ Ȁ ȁ Ȃ ȃ Ȅ ȅ Ȇ ȇ Ȉ ȉ Ȋ ȋ Ȍ ȍ Ȏ ȏ Ȑ ȑ Ȓ ȓ Ȕ ȕ Ȗ ȗ Ș ș Ț ț Ȟ ȟ Ƞ ȡ Ȥ ȥ Ȧ ȧ Ȩ ȩ Ȯ ȯ Ȳ ȳ ȴ ȵ ȶ ȷ Ⱥ Ȼ ȼ Ƚ Ⱦ ȿ ɀ Ƀ Ʉ Ʌ Ɇ ɇ Ɉ ɉ Ɋ ɋ Ɍ ɍ Ɏ ɏ ɐ ɑ ɓ ɔ ɕ ɖ ɗ ɘ ɛ ɜ ɝ ɞ ɟ ɠ ɡ ɢ ɥ ɦ ɨ ɪ ɫ ɬ ɭ ɯ ɰ ɱ ɲ ɳ ɴ ɵ ɹ ɺ ɻ ɼ ɽ ɾ ɿ ʀ ʁ ʂ ʇ ʈ ʉ ʋ ʌ ʍ ʎ ʏ ʐ ʑ ʗ ʙ ʚ ʛ ʜ ʝ ʞ ʟ ʠ ʮ ʰ ʲ ʳ ʴ ʶ ʷ ʸ ˡ ˢ ˣ ̌ ̽ ͓ ͣ ͤ ͥ ͦ ͧ ͨ ͩ ͪ ͫ ͬ ͭ ͮ ͯ ᴀ ᴃ ᴄ ᴅ ᴇ ᴈ ᴉ ᴊ ᴋ ᴌ ᴍ ᴎ ᴏ ᴐ ᴑ ᴒ ᴓ ᴖ ᴗ ᴘ ᴙ ᴚ ᴛ ᴜ ᴝ ᴞ ᴟ ᴠ ᴡ ᴢ ᵢ ᵣ ᵤ ᵥ Ḁ ḁ Ḃ ḃ Ḅ ḅ Ḇ ḇ Ḋ ḋ Ḍ ḍ Ḏ ḏ Ḑ ḑ Ḓ ḓ Ḙ ḙ Ḛ ḛ Ḟ ḟ Ḡ ḡ Ḣ ḣ Ḥ ḥ Ḧ ḧ Ḩ ḩ Ḫ ḫ Ḭ ḭ Ḱ ḱ Ḳ ḳ Ḵ ḵ Ḷ ḷ Ḻ ḻ Ḽ ḽ Ḿ ḿ Ṁ ṁ Ṃ ṃ Ṅ ṅ Ṇ ṇ Ṉ ṉ Ṋ ṋ Ṕ ṕ Ṗ ṗ Ṙ ṙ Ṛ ṛ Ṟ ṟ Ṡ ṡ Ṣ ṣ Ṫ ṫ Ṭ ṭ Ṯ ṯ Ṱ ṱ Ṳ ṳ Ṵ ṵ Ṷ ṷ Ṽ ṽ Ṿ ṿ Ẁ ẁ Ẃ ẃ Ẅ ẅ Ẇ ẇ Ẉ ẉ Ẋ ẋ Ẍ ẍ Ẏ ẏ Ẑ ẑ Ẓ ẓ Ẕ ẕ ẛ Ạ ạ Ả ả Ẹ ẹ Ẻ ẻ Ẽ ẽ Ỉ ỉ Ị ị Ọ ọ Ỏ ỏ Ụ ụ Ủ ủ Ỳ ỳ Ỵ ỵ Ỷ ỷ Ỹ ỹ ⁱ ₕ ₖ ₗ ₘ ₙ ₚ ₛ ₜ ℂ ℊ ℋ ℌ ℍ ℐ ℑ ℒ ℓ ℔ ℕ ℘ ℙ ℚ ℛ ℜ ℝ ℤ ℨ ℬ ℭ ℯ ℰ ℱ Ⅎ ℳ ℴ ℺ ⅁ ⅂ ⅃ ⅄ ⅅ ⅆ ⅇ ⅈ ⅉ ⅎ Ↄ ↄ ∽ ∾ ⋿ ⌧ ☒ ☰ ⚊ ✕ ✖ ✗ ✘ ⦁ ⦂ Ɫ Ɽ ⱥ ⱦ Ɑ Ɱ Ɐ Ȿ Ɀ ䷀ Ɥ Ɦ Ɜ Ɡ Ɬ Ʞ Ʇ 
```

# Using a custom charmap

You can use your own defined charmap for substitutions providing an object as a second parameter to the `normalize` function.

```js
normalize('AABB', {
  '97': 'E',
  '98': 'Z'
}); // EEZZ
```
