import os
import pymongo
import random
import re
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

book_id = os.environ.get('BOOK_ID')

# Connect to the MongoDB database
client = pymongo.MongoClient(os.environ.get('MONGODB_URI'))
db = client[os.environ.get('MONGODB_DB')]
book_collection = db["books"]
chapter_collection = db["chapters"]

cache_directory = "../.cache"

if not os.path.exists(cache_directory):
    os.makedirs(cache_directory)

# Define the path to the text file containing the ebook
file_path = f"{cache_directory}/book_{book_id}.txt"

# Read the contents of the text file
with open(file_path, 'r') as file:
    text = file.read()

book = book_collection.find_one({"reference": book_id})

if book:
    print(f"The book {book_id} had already been saved")
else:
    # Extract the title and author
    title_pattern = re.compile(r"Title: (.*?)\n")
    author_pattern = re.compile(r"Author: (.*?)\n")

    title = re.search(title_pattern, text).group(1)
    author = re.search(author_pattern, text).group(1)

    # Save the book in the MongoDB database
    book_data = {
        "reference": book_id,
        "title": title,
        "author": author,
        "chapters": []
    }
    result = book_collection.insert_one(book_data)
    new_book_id = result.inserted_id

    # Split the chapters using a regular expression
    #chapters = re.split(r'CHAPTER\s+(\d+|[IVXLCDM]+)\.', text)
    chapters = re.split(r'CHAPTER \d+\.', text)
    # Remove the table of contents by removing the first element of the list
    chapters_without_toc = chapters[1:]

    # Store each chapter in database with a reference to the book
    for i, chapter in enumerate(chapters_without_toc):
        chapter_obj = {
            "title": "Chapter {}".format(i + 1),
            "content": chapter
        }
        result = chapter_collection.insert_one(chapter_obj)
        chapter_id = result.inserted_id
        
        # Add the chapter to the book
        book_collection.update_one({"_id": new_book_id}, {"$push": {"chapters": chapter_id}})

    print(f"The book {book_id} has been successfully saved")
