# pylint: disable=missing-module-docstring
import os
import sys
import requests

BOOK_ID = int(sys.argv[1])
url = f"https://www.gutenberg.org/cache/epub/{BOOK_ID}/pg{BOOK_ID}.txt"

DATA_DIRECTORY = "./data"

if not os.path.exists(DATA_DIRECTORY):
    os.makedirs(DATA_DIRECTORY)

# Define the path to the text file containing the ebook
file_path = f"{DATA_DIRECTORY}/book_{BOOK_ID}.txt"

if not os.path.exists(file_path):
    # Make the request to the URL and get the response
    response = requests.get(url)

    # Check that the response is OK
    if response.status_code == 200:
        with open(
            f"{DATA_DIRECTORY}/book_{BOOK_ID}.txt",
            "w",
            encoding="utf-8"
        ) as f:
            f.write(response.text)

        print(f"The book \033[1;32m{BOOK_ID}\033[0m has been successfully fetched")
    else:
        print("The request failed with status code {}".format(response.status_code))
