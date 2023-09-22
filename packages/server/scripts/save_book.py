# pylint: disable=missing-module-docstring
import os
import sys
import re
import pymongo
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

BOOK_ID = int(sys.argv[1])

# Connect to the MongoDB database
client = pymongo.MongoClient(
    os.environ.get('MONGODB_URI')+'/'+os.environ.get('MONGODB_DB')
)
db = client[os.environ.get('MONGODB_DB')]
book_collection = db["books"]
chapter_collection = db["chapters"]

DATA_DIRECTORY = "./data"

# Define the path to the text file containing the ebook
file_path = f"{DATA_DIRECTORY}/book_{BOOK_ID}.txt"

# Read the contents of the text file
with open(file_path, 'r') as file:
    text = file.read()

# Check if the book already exists in the database
book = book_collection.find_one({"reference": BOOK_ID})

if book:
    print(f"The book \033[1;33m{BOOK_ID}\033[0m had already been saved")
else:
    # Extract the title and author using regex patterns
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

    # Split the chapters using regular expressions
    chapter_patterns = [
        r'\n{2,}CHAPTER[ .]+(\d+|[IVXLCDMivxlcdm]+)[ .]*\n',
        r'\n{2,}CHAPTER[ .]+([A-Z][\w ]*)\n',
        r'\n{2,}([A-Z][\w ]*)[ .]*(\d+|[IVXLCDMivxlcdm]+)\n',
        r'\n{2,}Chapter (\d+) ([A-Z\s]+)\n{1,}',
        r'\n{2,}CHAPTER (\d+|[IVXLCDMivxlcdm]+)\. ([A-Z\s]+)\n',
        r'\n{2,}BOOK[ .]*(\d+|[IVXLCDMivxlcdm]+)\n',
        r'\n{2,}VOLUME[ .]*(\d+|[IVXLCDMivxlcdm]+)\n',
        r'\n{2,}CANTO[ .]*(\d+|[IVXLCDMivxlcdm]+)\n',
        r'\n{2,}PART[ .]*(\d+|[IVXLCDMivxlcdm]+)\n',
        r'\n{2,}SECTION[ .]*(\d+|[IVXLCDMivxlcdm]+)\n',
        r'\n{2,}LETTER[ .]*(\d+|[IVXLCDMivxlcdm]+)\n',
        r'\n{2,}Canto[ .]*(\d+|[IVXLCDMivxlcdm]+)\n',
        r'\n{2,}(\d+)\n',
        r'\n{2,}([IVXLCDMivxlcdm]+)\n',
        r'\n{2,}([A-Z][\w ]*)\n',
    ]

    for pattern in chapter_patterns:
        chapters = re.split(pattern, text, flags=re.I)

        if len(chapters) > 1:
            break

    chapters_count = len(chapters)

    # Minimum number of paragraphs required in a chapter
    MIN_PARAGRAPHS = 10

    # Minimum number of chapters
    MIN_CHAPTERS = 8

    flagged_chapters = []

    if not chapters:
        print("No chapters found.")

    # Check each chapter for the required number of paragraphs
    gutenberg_pattern = re.compile(r"GUTENBERG", re.IGNORECASE)

    for chapter in chapters:
        paragraph_count = chapter.count('\n')

        # Check if the chapter contains the word "GUTENBERG" to exclude Gutenberg template decorator
        contains_gutenberg = re.search(gutenberg_pattern, chapter)

        if paragraph_count >= MIN_PARAGRAPHS and not contains_gutenberg:
            flagged_chapters.append(chapter)

    chapters_count = len(flagged_chapters)

    if chapters_count <= MIN_CHAPTERS:
        print(
            f"\033[1;33mThe book {BOOK_ID} has too few chapters ({chapters_count} found)\033[0m"
        )

        # Delete the book
        book_collection.delete_one({'_id': str(BOOK_ID)})
    else:
        # Store each chapter in the database with a reference to the book
        for i, chapter in enumerate(flagged_chapters):
            # Count the number of paragraphs using the newline character
            paragraph_count = chapter.count('\n')

            chapter_obj = {
                "title": f"Chapter {i + 1}",
                "content": chapter,
            }
            result = chapter_collection.insert_one(chapter_obj)
            chapter_id = result.inserted_id

            # Link book to chapters
            chapter_collection.update_many({
                "_id": chapter_id
            }, {
                "$push": {"book": new_book_id}
            })

            # Add the chapter to the book
            book_collection.update_one({
                "_id": new_book_id
            }, {
                "$push": {"chapters": chapter_id}
            })

        saved_book_count = chapter_collection.count_documents(
            {"book": new_book_id}
        )

        print(
            f"The book \033[1;32m{BOOK_ID}\033[0m has been successfully saved with \033[1;32m{saved_book_count}\033[0m chapters"
        )
