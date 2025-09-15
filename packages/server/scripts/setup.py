# pylint: disable=missing-module-docstring
# https://www.gutenberg.org/ebooks/search/?sort_order=downloads
import argparse
import subprocess
import os
import pymongo
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

parser = argparse.ArgumentParser(description='Fetch and save book data')
parser.add_argument(
    '--delete',
    dest='delete',
    action='store_true',
    help='delete the book(s) before fetching and saving'
)

args = parser.parse_args()

# Connect to the MongoDB database
mongodb_uri = os.environ.get('MONGODB_URI')
mongodb_db = os.environ.get('MONGODB_DB')

if not mongodb_uri or not mongodb_db:
    print("Error: MONGODB_URI and MONGODB_DB environment variables must be set")
    print("Please create a .env file based on .env.dist and set these values")
    exit(1)

try:
    client = pymongo.MongoClient(f"{mongodb_uri}/{mongodb_db}")
    db = client[mongodb_db]
    # Test the connection
    client.admin.command('ping')
    print(f"Successfully connected to MongoDB at {mongodb_uri}")
except pymongo.errors.ServerSelectionTimeoutError as e:
    print(f"Error: Could not connect to MongoDB at {mongodb_uri}")
    print("Make sure MongoDB is running locally or update MONGODB_URI in your .env file")
    print(f"Connection error: {e}")
    exit(1)
haiku_collection = db["haikus"]

# Added expiration index on haiku collection
db.haiku_collection.create_index("expireAt", expireAfterSeconds=0)

ids = [
    11,     # Alice’s Adventures in Wonderland
    16,     # Peter Pan
    21,     # Aesop’s Fables
    36,     # The War of the Worlds
    45,     # Anne of Green Gables
    55,     # The Wonderful Wizard of Oz
    74,     # The Adventures of Tom Sawyer
    76,     # Adventures of Huckleberry Finn
    84,     # Frankenstein
    105,    # Persuasion
    120,    # Treasure Island
    145,    # Middlemarch
    158,    # Emma
    161,    # Sense and Sensibility
    174,    # The Picture of Dorian Gray
    203,    # Uncle Tom’s Cabin
    224,    # A Pair of Blue Eyes
    244,    # A Study In Scarlet
    345,    # Dracula
    394,    # Cranford
    408,    # The Souls of Black Folk
    600,    # Notes from the Underground
    730,    # Oliver Twist
    766,    # David Copperfield
    768,    # Wuthering Heights
    863,    # The Mysterious Affair at Styles
    986,    # Master and Man
    996,    # The History of Don Quixote
    1184,   # The Count of Monte Cristo
    1232,   # The Prince
    1259,   # Twenty Years After
    1260,   # Jane Eyre: An Autobiography
    1342,   # Pride and prejudice
    1399,   # Anna Karenina
    1400,   # Great Expectations
    1497,   # Republic
    1661,   # The Adventures of Sherlock Holmes
    1998,   # Thus Spake Zarathustra: A Book for All and None
    2600,   # War and Peace
    2641,   # A Room With A View
    2701,   # Moby Dick; or The Whale
    2852,   # The Hound of the Baskervilles
    3207,   # Leviathan
    3296,   # The Confessions of St. Augustine
    3300,   # An Inquiry into the Nature and Causes of the Wealth of Nations
    3306,   # At Suvla Bay
    3360,   # Letters to His Son, 1766-1771
    3361,   # The PG Edition of Chesterfield's Letters to His Son
    3362,   # The Kentons
    3365,   # Their Wedding Journey
    3600,   # The Essays of Montaigne, Complete
    4085,   # The Adventures of Roderick Random
    5827,   # The Problems of Philosophy
    6130,   # The Iliad of Homer
    6593,   # The History of Tom Jones, a Foundling
    6761,   # The Adventures of Ferdinand Count Fathom — Complete
    8492,   # The King in Yellow
    8800,   # The Divine Comedy
    11030,  # Incidents in the Life of a Slave Girl
    16389,  # The Enchanted April
    22381,  # Myths and Legends of Ancient Greece and Rome
    24869,  # The Rámáyan of Válmíki
    27827,  # The Kama Sutra of Vatsyayana
    28054,  # The Brothers Karamazov
    36034,  # White Nights and Other Stories
    55264,  # On Growth and Form
    64317,  # The Great Gatsby
    67979,  # The Blue Castle
    69087,  # The murder of Roger Ackroyd
    70114,  # The big four
    70225,  # The Fortunate Calamity
    70236,  # The secret of the old mill
    70302,  # Education and the good life
    70471,  # Kabuki
    70473,  # Forrest house
    70525,  # Sahara
    70530,  # Physician and patient
    70749,  # Cosmic symbolism
    70875,  # Arrowsmith
    70882,  # The clue of the new pin
    70883,  # Doctor Hathern's daughters
    71449,  # Meg of the Heather
    71450,  # My heart's in the Highlands
    71454,  # Guide to the study of animal ecology
    72123,  # The Arctic World
    72132,  # Daddy Joe's fiddle
    72133,  # The octopus
    73340,  # Worthy of his name
]

delete_books = args.delete

for id in ids:
    if delete_books:
        subprocess.run(["python3", "scripts/delete_book.py", str(id)])
    subprocess.run(["python3", "scripts/fetch_book.py", str(id)])
    subprocess.run(["python3", "scripts/save_book.py", str(id)])
