import os
import sys
import requests

book_id = int(sys.argv[1])
url = f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt"

cache_directory = "../.cache"

if not os.path.exists(cache_directory):
    os.makedirs(cache_directory)

# Define the path to the text file containing the ebook
file_path = f"{cache_directory}/book_{book_id}.txt"

if not os.path.exists(file_path):
    # Make the request to the URL and get the response
    response = requests.get(url)

    # Check that the response is OK
    if response.status_code == 200:
        cache_directory = "../.cache"

        with open(f"{cache_directory}/book_{book_id}.txt", "w", encoding="utf-8") as f:
            f.write(response.text)
            
        print(f"The book \033[1;32m{book_id}\033[0m has been successfully fetched")
    else:
        print("The request failed with status code {}".format(response.status_code))

