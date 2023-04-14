import * as brain from "brain.js";

// Définir les données d'entraînement
const trainingData = [
    { input: "Le vent souffle fort,", output: "le vent emporte les feuilles." },
    { input: "Un ciel d'hiver clair", output: "scintille de froides étoiles." },
    { input: "La lune est levée,", output: "les étoiles dansent dans le ciel." }
];

// Créer l'instance de réseau LSTM
const lstm = new brain.recurrent.LSTM();

// Entraîner le réseau avec les données d'entraînement
lstm.train(trainingData, {
    iterations: 2000,
    log: true,
    //learningRate: 0.05,
    //errorThresh: 0.01
});

//console.log(lstm.toJSON());

// Utiliser le réseau pour générer un haiku
const input = "Un hiver doux et calme,";
const output = lstm.run(input);

console.log(`Haiku généré : ${input} ${output}`);
