// Définition de l'ensemble de poèmes haïkus existants
const haikus: string[] = [
    "Un vieil étang\nUne grenouille saute\nLe bruit de l'eau",
    "Une feuille tombe\nSe pose délicatement sur\nLa surface de l'eau",
    // ... autres poèmes haïkus
];

// Fonction pour construire la matrice de transition
function buildTransitionMatrix(poems: string[]): Map<string, Map<string, number>> {
    const words: string[] = poems.join("\n").split(/\s+/);
    const transitionMatrix: Map<string, Map<string, number>> = new Map();

    // Initialiser la matrice de transition pour chaque mot unique
    for (const word of words) {
        if (!transitionMatrix.has(word)) {
            transitionMatrix.set(word, new Map());
        }
    }

    // Compter les occurrences des paires de mots pour chaque poème
    for (const poem of poems) {
        const lines: string[] = poem.split("\n");
        for (const line of lines) {
            const lineWords: string[] = line.split(/\s+/);
            for (let i = 0; i < lineWords.length - 1; i++) {
                const word1: string = lineWords[i];
                const word2: string = lineWords[i + 1];

                const transitionCounts: Map<string, number> = transitionMatrix.get(word1)!;
                const count: number = transitionCounts.has(word2) ? transitionCounts.get(word2)! + 1 : 1;
                transitionCounts.set(word2, count);
            }
        }
    }

    // Normaliser les probabilités de transition pour chaque mot
    for (const [word, transitionCounts] of transitionMatrix) {
        let totalCount = 0;
        for (const count of transitionCounts.values()) {
            totalCount += count;
        }

        for (const [nextWord, count] of transitionCounts) {
            transitionCounts.set(nextWord, count / totalCount);
        }
    }

    return transitionMatrix;
}

// Fonction pour générer un haïku à partir de la matrice de transition
function generateHaiku(transitionMatrix: Map<string, Map<string, number>>): string[] {
    const haiku: string[] = [];

    // Choix d'un mot aléatoire pour le premier vers
    const firstWord: string = Array.from(transitionMatrix.keys())[Math.floor(Math.random() * transitionMatrix.size)];
    haiku.push(firstWord);

    // Génération du deuxième vers
    let secondWord = "";
    let secondWordProbability = 0;
    const firstWordTransitions: Map<string, number> = transitionMatrix.get(firstWord)!;
    for (const [word, probability] of firstWordTransitions) {
        if (probability > secondWordProbability) {
            secondWord = word;
            secondWordProbability = probability;
        }
    }
    haiku.push(secondWord);

    // Génération du troisième vers
    let thirdWord = "";
    let thirdWordProbability = 0;
    const secondWordTransitions: Map<string, number> = transitionMatrix.get(secondWord)!;
    for (const [word, probability] of secondWordTransitions) {
        if (probability > thirdWordProbability) {
            thirdWord = word;
            thirdWordProbability = probability;
        }
    }
    haiku.push(thirdWord);

    return haiku;
}

// Construction de la matrice de transition
const transitionMatrix: Map<string, Map<string, number>> = buildTransitionMatrix(haikus);

console.log(transitionMatrix);

// Génération d'un haïku aléatoire
const haiku: string[] = generateHaiku(transitionMatrix);
console.log(haiku.join("\n"));
