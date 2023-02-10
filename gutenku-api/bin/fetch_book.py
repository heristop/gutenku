import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

book_id = os.environ.get('BOOK_ID')
url = f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt"

# Make the request to the URL and get the response
response = requests.get(url)

# Check that the response is OK
if response.status_code == 200:
    cache_directory = "../.cache"

    with open(f"{cache_directory}/book_{book_id}.txt", "w", encoding="utf-8") as f:
        f.write(response.text)
        
    print(f"The book {book_id} has been successfully fetched")
else:
    print("The request failed with status code {}".format(response.status_code))
