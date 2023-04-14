import Markov from 'js-markov';

// Create a new Markov Chain
// By default, its type is text
const markov = new Markov();

// Add some states
markov.addStates([
    'Today is sunny',
    'Today is rainy',
    'The weather is sunny',
    'The weather for today is sunny',
    'The weather for tomorrow might be rainy'
]);

// Train the Markov Chain
markov.train();

// Generate an output
console.log(markov.generateRandom());
