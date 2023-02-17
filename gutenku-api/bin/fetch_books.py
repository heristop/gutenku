import subprocess

ids = [
    2701,   # Moby Dick; or The Whale
    11,     # Alice’s Adventures in Wonderland
    6130,   # The Iliad of Homer
    76,     # Adventures of Huckleberry Finn
    #98,    # A Tale of Two Cities @fixme
    1259,   # Twenty Years After
    1342,   # Pride and prejudice
    #67979, # The Blue Castle @fixme
    244,    # A Study In Scarlet
    #74,    # The Adventures of Tom Sawyer @fixme
    2852,   # The Hound of the Baskervilles
    #16,    # Peter Pan @fixme
    6593,   # The History of Tom Jones, a Foundling
    1232,   # The Prince
    1184,   # The Count of Monte Cristo
    1497,   # Republic
    #768,   # Wuthering Heights @fixme
    #55,    # The Wonderful Wizard of Oz @fixme
    145,    # Middlemarch
    174,    # The Picture of Dorian Gray
    #1400,  # Great Expectations @fixme
    #23,    # Narrative of the Life of Frederick Douglass @fixme
]

for id in ids:
    subprocess.run(["python3", "delete_book.py", str(id)])
    subprocess.run(["python3", "fetch_book.py", str(id)])
    subprocess.run(["python3", "save_book.py", str(id)])