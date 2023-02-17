import os
import pymongo
import sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

book_id = int(sys.argv[1])

# Connect to the MongoDB database
client = pymongo.MongoClient(os.environ.get('MONGODB_URI'))
db = client[os.environ.get('MONGODB_DB')]
book_collection = db["books"]
chapter_collection = db["chapters"]

book = book_collection.find_one({"reference": book_id})

if book:
    # Delete all chapters associated with the book
    chapter_collection.delete_many({'book_id': book["_id"]})

    # Delete the book
    book_collection.delete_one({'_id': book["_id"]})

    print(f"The book \033[1;32m{book_id}\033[0m has been successfully deleted")