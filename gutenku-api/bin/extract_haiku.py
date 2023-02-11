import os
import pymongo
import random
import re
import requests

def get_random_chapter():
    # Connect to the MongoDB database
    client = pymongo.MongoClient("mongodb://root:root@localhost:27017/")
    db = client["admin"]
    book_collection = db["books"]
    chapter_collection = db["chapters"]

    # Find all books in the collection
    books = list(book_collection.find({}))

    # Choose a random book
    selected_book = random.choice(books)

    # Get the chapters of the selected book
    chapters = selected_book["chapters"]

    # Choose a random chapter
    selected_chapter = chapter_collection.find_one({"_id": random.choice(chapters)})

    return selected_chapter.get('content')

def extract_haiku(chapter):
    min_length = 5
    max_length = 10

    sentences = []

    while len(sentences) < 3:
        # Splits the chapter into sentences
        sentences = re.split(r'[.?!]', chapter)

        # Clean
        sentences = [s.strip().replace("\n", " ").replace("\"", " ") for s in sentences if len(s.strip().split(" ")) >= min_length and len(s.strip().split(" ")) < max_length]

        # Increase max_length if no sentences had been found to exit loop
        if len(sentences) < 3:
            max_length = max_length + 1

        if max_length > 25:
            break;

    # Select three random sentences
    haiku_sentences = random.sample(sentences, 3)
    haiku_sentences = [s.strip() for s in haiku_sentences]

    # Return the haiku as a formatted string
    return "\n".join(haiku_sentences)

chapter = get_random_chapter()

haiku = extract_haiku(chapter)
print(haiku)
