import brain from 'brain.js';
import fs from 'fs';

// Charger les données d'apprentissage à partir d'un fichier texte
//const data: string = fs.readFileSync('data.txt', 'utf8');

const data: string = 'Peter was not with them for the moment, and they felt rather lonely up\n' +
    'there by themselves. He could go so much faster than they that he would\n' +
    'suddenly shoot out of sight, to have some adventure in which they had no\n' +
    'share. He would come down laughing over something fearfully funny he had\n' +
    'been saying to a star, but he had already forgotten what it was, or he\n' +
    'would come up with mermaid scales still sticking to him, and yet not be\n' +
    'able to say for certain what had been happening. It was really rather\n' +
    'irritating to children who had never seen a mermaid.';

// Prétraiter les données pour créer des paires de phrases
const pairs: Array<[Array<string>, string]> = data.split('\n').map(line => {
    const sentences: Array<string> = line.split(/[.?!]+/).map(sentence => sentence.trim());
    return [sentences.slice(0, -1), sentences.slice(-1)[0]];
}).filter(pair => pair[0].length > 0 && pair[1].length > 0);

// Initialiser le réseau de neurones
const net = new brain.recurrent.LSTM();

// Entraîner le réseau de neurones sur les paires de phrases
net.train(pairs, {
    iterations: 2000,
    log: true,
    learningRate: 0.05,
    errorThresh: 0.01,
});

// Générer du texte à partir du réseau de neurones
const generateText = (options: {
    maxTries?: number;
    filter?: (result: brain.IResult) => boolean;
    transformer?: (result: any) => any;
}): string => {
    const maxTries: number = options.maxTries || 10;
    const filter: (result: brain.IResult) => boolean = options.filter || (() => true);
    const transformer: (result: any) => any = options.transformer || (result => result.string);

    let tries = 0;
    let result: brain.IResult = null;

    while (tries < maxTries) {
        result = net.run([]);
        tries++;

        if (filter(result)) {
            break;
        }
    }

    return transformer(result);
};

// Générer 10 phrases aléatoires en utilisant la fonction generateText
for (let i = 0; i < 10; i++) {
    console.log(generateText({
        maxTries: 100,
        filter: result => result.string.split(' ').length >= 5 && result.string.split(' ').length <= 15,
        transformer: result => result.string.trim(),
    }));
}
