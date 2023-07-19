# This code sample uses the 'requests' library:
# http://docs.python-requests.org
import requests
from requests.auth import HTTPBasicAuth
import json
import os
os.environ['CURL_CA_BUNDLE'] = ''


#To get title of each page and ID in a specific space ID
#url = "https://comparethemarket.atlassian.net/wiki/api/v2/spaces/4338057361/pages"

#To get the ID fo a specific space
#url = "https://comparethemarket.atlassian.net/wiki/rest/api/space/paperqates"

url = "https://comparethemarket.atlassian.net/wiki/api/v2/pages/4338090247?body-format=storage"

#GET /rest/api/content/{pageId}

auth = HTTPBasicAuth("Pravin.Prabhakaran@comparethemarket.com", "ATATT3xFfGF0UZGUOEbU1mjNS18ci71Wu8v5_oS0eI4QqOht-xBEb7wLwj1b4aEOLfBdJknxeJbqVUB1BPbvfYCLgMeAbqcv4y7tak3at4v7OIwczChbXWedeFpc0--n47AHxyluNOw5DiI7NmXwAVjvzcKmzU2MuiwDgi-Yc71JPJd5XM5FAig=EED69AC9")

headers = {
  "Accept": "application/json"
}

response = requests.request(
   "GET",
   url,
   headers=headers,
   auth=auth
)

print(json.dumps(json.loads(response.text), sort_keys=True, indent=4, separators=(",", ": ")))





"""
confluence_url = "https://comparethemarket.atlassian.net/wiki/"
space_key = "Paperqates"
api_url = f"{confluence_url}/rest/api/content?spaceKey={space_key}"

auth = "Pravin.Prabhakaran@comparethemarket.com" + ":" + "ATATT3xFfGF0UZGUOEbU1mjNS18ci71Wu8v5_oS0eI4QqOht-xBEb7wLwj1b4aEOLfBdJknxeJbqVUB1BPbvfYCLgMeAbqcv4y7tak3at4v7OIwczChbXWedeFpc0--n47AHxyluNOw5DiI7NmXwAVjvzcKmzU2MuiwDgi-Yc71JPJd5XM5FAig=EED69AC9"
encoded = base64.b64encode(bytes(auth, "utf-8"))
encodedAuth = encoded.decode("utf-8")

# Replace 'YOUR_API_TOKEN' with your actual API token or set up appropriate authentication headers
headers = {
    "Accept":"application/json",
    "Authorization": "Bearer " + encodedAuth,
    "Content-Type": "application/json",
}

response = requests.get(api_url, headers=headers)

if response.status_code == 200:
    pages_data = response.json()
    # Process pages_data to access the page information
else:
    print("Failed to fetch pages. Status code:", response.status_code)
    print(response.text)
"""