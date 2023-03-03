# pylint: disable=missing-module-docstring
import os
import sys
import pymongo
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

BOOK_ID = int(sys.argv[1])

# Connect to the MongoDB database
client = pymongo.MongoClient(os.environ.get('MONGODB_URI')+'/'+os.environ.get('MONGODB_DB'))
db = client[os.environ.get('MONGODB_DB')]
book_collection = db["books"]
chapter_collection = db["chapters"]

book = book_collection.find_one({"reference": BOOK_ID})

if book:
    # Delete all chapters associated with the book
    chapter_collection.delete_many({'BOOK_ID': book["_id"]})

    # Delete the book
    book_collection.delete_one({'_id': book["_id"]})

    print(f"The book \033[1;32m{BOOK_ID}\033[0m has been successfully deleted")
