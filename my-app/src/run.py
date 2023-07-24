import os
import sys

#Not relevant - fixed an SSL certificate issue that I had only on MAC
#import os
#os.environ['CURL_CA_BUNDLE'] = ''

def print2(text):
    sys.stdout.write(text)
    sys.stdout.flush()

print2("Running")

if len(sys.argv) < 2:  # At least the API key must be provided
    print2("Please provide the required API key argument.")
    sys.exit(1)


api_key = sys.argv[1]
document_paths = sys.argv[2:]
print(sys.argv)
print2("Obtained API key")
print(api_key)
os.environ["OPENAI_API_KEY"] = api_key

from paperqa import Docs
#Not relevant - fixed an SSL certificate issue that I had only on MAC
#os.environ[‘CURL_CA_BUNDLE’] = ‘’
home_dir = os.path.expanduser("~")
my_docs = []

for doc_path in document_paths:
    my_docs.append(doc_path)

print("Added doc paths", my_docs)

docs = Docs(llm="gpt-3.5-turbo")
for d in my_docs:
    docs.add(d)

print2("Added doc paths to Docs object")
while True:
    print2("Enter a question or type q to quit")
    question = sys.stdin.readline().strip()
    print2(question)
    question += ". Tell me in 3 sentences"
    if question == "q":
        print2("trying to quit - python")
        break
    else:
        answer = docs.query(question)
        print2(answer.formatted_answer)

    print2("working")