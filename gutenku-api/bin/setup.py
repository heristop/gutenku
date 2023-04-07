# pylint: disable=missing-module-docstring
import argparse
import subprocess
import os
import pymongo
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

parser = argparse.ArgumentParser(description='Fetch and save book data')
parser.add_argument('--delete', dest='delete', action='store_true',
                    help='delete the book(s) before fetching and saving')

args = parser.parse_args()

# Connect to the MongoDB database
client = pymongo.MongoClient(os.environ.get(
    'MONGODB_URI')+'/'+os.environ.get('MONGODB_DB'))
db = client[os.environ.get('MONGODB_DB')]
haiku_collection = db["haikus"]

# Added expiration index on haiku collection
db.haiku_collection.create_index("expireAt", expireAfterSeconds=0)

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
    161,    # Sense and Sensibility
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
    4085,   # The Adventures of Roderick Random
    5827,   # The Problems of Philosophy
    6130,   # The Iliad of Homer
    6593,   # The History of Tom Jones, a Foundling
    8800,   # The Divine Comedy
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
    70301,  # My leper friends
    70302,  # Education and the good life
    70304,  # The Inquisition
    70305,  # Torwood's trust (Vol. 1 of 3)
    70306,  # Torwood's trust (Vol. 2 of 3)
    70307,  # Torwood's trust (Vol. 3 of 3)
    70308,  # On the mechanism of the physiological action of the cathartics
    70471,  # Kabuki
    70473,  # Forrest house
    70478,  # The silver key
]

delete_books = args.delete

for id in ids:
    if delete_books:
        subprocess.run(["python3", "bin/delete_book.py", str(id)])
    subprocess.run(["python3", "bin/fetch_book.py", str(id)])
    subprocess.run(["python3", "bin/save_book.py", str(id)])
