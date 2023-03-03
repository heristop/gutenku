# pylint: disable=missing-module-docstring
import os
import sys
import re
import pymongo
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

BOOK_ID = int(sys.argv[1])

# Connect to the MongoDB database
client = pymongo.MongoClient(os.environ.get('MONGODB_URI')+'/'+os.environ.get('MONGODB_DB'))
db = client[os.environ.get('MONGODB_DB')]
book_collection = db["books"]
chapter_collection = db["chapters"]

CACHE_DIRECTORY = ".cache"

# Define the path to the text file containing the ebook
file_path = f"{CACHE_DIRECTORY}/book_{BOOK_ID}.txt"

# Read the contents of the text file
with open(file_path, 'r') as file:
    text = file.read()

book = book_collection.find_one({"reference": BOOK_ID})

if book:
    print(f"The book {BOOK_ID} had already been saved")
else:
    # Extract the title and author
    title_pattern = re.compile(r"Title: (.*?)\n")
    author_pattern = re.compile(r"Author: (.*?)\n")

    title = re.search(title_pattern, text).group(1)
    author = re.search(author_pattern, text).group(1)

    # Save the book in the MongoDB database
    book_data = {
        "reference": BOOK_ID,
        "title": title,
        "author": author,
        "chapters": []
    }
    result = book_collection.insert_one(book_data)
    new_book_id = result.inserted_id

    # Split the chapters using a regular expression
    chapter_patterns = r'(CHAPTER|BOOK|Chapter) (\d+|[IVXLCDMivxlcdm]+)'
    chapters = re.split(chapter_patterns, text)
    chapters_count = len(chapters)

    if chapters_count <= 1:
        # Try a different pattern if the first one doesn't work
        chapter_patterns = r'(\d+|[IVXLCDMivxlcdm]+)\.'
        chapters = re.split(chapter_patterns, text)
        chapters_count = len(chapters)

    if chapters_count <= 20:
        print(f"\033[1;33mThe book {BOOK_ID} has too few chapters ({chapters_count} found)\033[0m")
    else:
        print(f"The book \033[1;32m{BOOK_ID}\033[0m has \033[1;32m{chapters_count}\033[0m chapters")

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
            book_collection.update_one({
                "_id": new_book_id}, {
                "$push": {"chapters": chapter_id}
            })

        print(f"The book \033[1;32m{BOOK_ID}\033[0m has been successfully saved")
