from openai import OpenAI
# this has squiggle but env still works so idk man
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

client = OpenAI()

html_file_path = "index.html"
with open(html_file_path, 'r') as file:
    html_content = file.read()

prompt = f"Please make the following HTML more semantic and accessible. Consider using header tags instead of just <p> or using <section>/<article> instead of <div> where appropriate. Here is the HTML content:\n\n{html_content}"

# Send the prompt to the ChatGPT API
completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}
    ]
)

# Print the response
print(completion.choices[0].message.content)


