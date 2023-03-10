# pylint: disable=missing-module-docstring
import subprocess

ids = [
    11,     # Alice’s Adventures in Wonderland
    16,     # Peter Pan
    23,     # Narrative of the Life of Frederick Douglass
    35,     # The Time Machine
    36,     # The War of the Worlds
    45,     # Anne of Green Gables
    55,     # The Wonderful Wizard of Oz
    74,     # The Adventures of Tom Sawyer
    76,     # Adventures of Huckleberry Finn
    84,     # Frankenstein
    105,    # Persuasion
    158,    # Emma
    174,    # The Picture of Dorian Gray
    203,    # Uncle Tom’s Cabin
    215,    # The Call of the Wild
    244,    # A Study In Scarlet
    345,    # Dracula
    394,    # Cranford
    730,    # Oliver Twist
    768,    # Wuthering Heights
    996,    # The History of Don Quixote
    1184,   # The Count of Monte Cristo
    1232,   # The Prince
    1259,   # Twenty Years After
    1342,   # Pride and prejudice
    1399,   # Anna Karenina
    1400,   # Great Expectations
    1497,   # Republic
    1661,   # The Adventures of Sherlock Holmes
    2600,   # War and Peace
    2701,   # Moby Dick; or The Whale
    2852,   # The Hound of the Baskervilles
    3207,   # Leviathan
    5827,   # The Problems of Philosophy
    6130,   # The Iliad of Homer
    6593,   # The History of Tom Jones, a Foundling
    25344,  # The Scarlet Letter
    27827,  # The Kama Sutra of Vatsyayana
    28054,  # The Brothers Karamazov
    64317,  # The Great Gatsby
    67098,  # Winnie-the-,Pooh
    67979,  # The Blue Castle
    70114,  # The big four
    70225,  # The Fortunate Calamity
    70234,  # Hugh Worthington,
    70236,  # The secret of the old mill
]

for id in ids:
    subprocess.run(["python3", "bin/delete_book.py", str(id)])
    subprocess.run(["python3", "bin/fetch_book.py", str(id)])
    subprocess.run(["python3", "bin/save_book.py", str(id)])
