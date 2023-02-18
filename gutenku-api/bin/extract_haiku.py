import os
import pymongo
import random
import re
import requests
import openai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

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
        sentences = re.split(r'[.?!,]', chapter)

        # Clean
        sentences = [s.strip().replace("\n", " ").replace("\"", " ") for s in sentences if len(s.strip().split(" ")) >= min_length and len(s.strip().split(" ")) < max_length]

        # Increase max_length if no sentences had been found to exit loop
        if len(sentences) < 3:
            max_length = max_length + 1

        if max_length > 25:
            break;

    if len(sentences) < 3:
        return []

    # Select three random sentences
    haiku_sentences = random.sample(sentences, 3)
    haiku_sentences = [s.strip() for s in haiku_sentences]

    # Return the haiku as a formatted string
    return "\n".join(haiku_sentences)

haiku = []

while len(haiku) < 3:
    chapter = get_random_chapter()
    haiku = extract_haiku(chapter)

print(haiku)

openai.api_key = os.getenv("OPENAI_API_KEY")

def evaluate_haiku(haiku):
    # Generate a text sequence from the Haiku
    prompt="Evaluate the relevance of this haiku. \nOn first Line, say if if the text is revelant or not revelant, on second line give a score / 10, and on third line, explain the meaning :"  + "\n\n".join(haiku) ,

    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        temperature=0.7,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    text_sequence = response.choices[0].text
    print(text_sequence)

evaluate_haiku(haiku)
