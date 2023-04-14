import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';

const SEQUENCE_LENGTH = 10;
const BATCH_SIZE = 64;
const EMBEDDING_DIM = 64;
const UNITS = 128;
const EPOCHS = 100;
const START_TOKEN = '<s>';
const END_TOKEN = '</s>';

async function loadHaikus(filename: string): Promise<string[]> {
    // Charger le fichier des haïkus
    const file = await fs.promises.readFile(filename, 'utf8');

    // Diviser le fichier en lignes et supprimer les espaces superflus
    const lines = file.split('\n').map(line => line.trim());

    // Supprimer les lignes vides
    return lines.filter(line => line.length > 0);
}

async function tokenizeHaikus(haikus: string[]): Promise<tf.data.Tokenizer> {
    // Créer un tokenizer à partir des haïkus
    const tokenizer = tf.data.tokenizerFromData(haikus);

    // Ajouter les tokens de début et de fin
    tokenizer.addToken(START_TOKEN);
    tokenizer.addToken(END_TOKEN);

    return tokenizer;
}

async function trainHaikuModel(): Promise<tf.LayersModel> {
    // Charger les haïkus
    const haikus = await loadHaikus('haikus.txt');

    // Tokenizer les haïkus
    const tokenizer = await tokenizeHaikus(haikus);

    // Prétraiter les données
    const sequences = tf.data.generator(function* () {
        for (const haiku of haikus) {
            // Ajouter les tokens de début et de fin au haïku
            const paddedHaiku = START_TOKEN + ' ' + haiku + ' ' + END_TOKEN;

            // Générer des séquences de tokens
            for (let i = 0; i < paddedHaiku.length - SEQUENCE_LENGTH; i++) {
                // Extraire la séquence d'entrée et la sortie correspondante
                yield {
                    input: paddedHaiku.slice(i, i + SEQUENCE_LENGTH),
                    output: paddedHaiku[i + SEQUENCE_LENGTH]
                };
            }
        }
    })
        .map(({ input, output }) => {
            // Convertir les tokens en indices numériques
            const inputIds = tokenizer.tokenize(input).ids;
            const outputId = tokenizer.tokenize(output).ids[0];

            return { input: inputIds, output: outputId };
        })
        .batch(BATCH_SIZE)
        .prefetch(tf.data.AUTOTUNE);

    // Définir le modèle
    const model = tf.sequential({
        layers: [
            tf.layers.embedding({
                inputDim: tokenizer.getVocabularySize(),
                outputDim: EMBEDDING_DIM
            }),
            tf.layers.gru({
                units: UNITS,
                returnSequences: false,
                stateful: false
            }),
            tf.layers.dense({
                units: tokenizer.getVocabularySize(),
                activation: 'softmax'
            })
        ]
    });

    // Compiler le modèle
    model.compile({
        optimizer: tf.train.adam(),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });

    // Entraîner le modèle
    await model.fitDataset(sequences, { epochs: EPOCHS });

    return model;
}

async function generateHaiku(model: tf.LayersModel): Promise<string> {
    // Générer le premier token
    const tokenizer = tf.data.tokenizerFromData([START_TOKEN, END_TOKEN]);
    const startTokenId = tokenizer.tokenize(START_TOKEN).ids[0];
    let currentToken = startTokenId;

    // Initialiser la séquence générée
    let generatedSequence = '';

    // Générer les tokens un par un
    while (currentToken !== tokenizer.tokenize(END_TOKEN).ids[0] &&
        generatedSequence.length < SEQUENCE_LENGTH) {
        // Ajouter le token courant à la séquence générée
        generatedSequence += tokenizer.detokenize([currentToken]).slice(-1);
        // Préparer les données d'entrée pour le modèle
        const input = tf.tensor2d([[currentToken]]);

        // Prédire le prochain token
        const predictions = model.predict(input);
        const nextToken = await tf.argMax(predictions.squeeze(), axis = 1).data();
        currentToken = nextToken[0];

        // Libérer la mémoire utilisée par les tenseurs
        tf.dispose([input, predictions]);
    }

    // Retourner la séquence générée sans les tokens de début et de fin
    return generatedSequence.slice(1, -1);
}

async function evaluateHaikuTransitions(model: tf.LayersModel, numHaikus: number): Promise<void> {
    // Générer des haïkus aléatoires et calculer les scores de transition pour chaque haïku
    const scores: Map<string, number> = new Map();

    for (let i = 0; i < numHaikus; i++) {
        const haiku = await generateHaiku(model);
        const haikuTokens = haiku.split(' ');
        // Calculer les scores de transition pour chaque paire de tokens
        for (let j = 0; j < haikuTokens.length - 1; j++) {
            const transition = `${haikuTokens[j]}->${haikuTokens[j + 1]}`;
            scores.set(transition, (scores.get(transition) ?? 0) + 1);
        }
    }

    // Afficher les scores de transition triés par ordre décroissant
    Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([transition, score]) => {
            console.log(`${transition}: ${score}`);
        });
}

async function main() {
    // Entraîner le modèle
    const model = await trainHaikuModel();

    // Évaluer les transitions de haïkus
    await evaluateHaikuTransitions(model, 100);
}

main();
