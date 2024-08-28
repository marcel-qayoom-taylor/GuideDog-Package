from openai import OpenAI
# this has squiggle but env still works so idk man
import subprocess  # for opening files in VSCode

# run this script using `python main.py` in the terminal

client = OpenAI()

html_file_path = "index.html"
with open(html_file_path, 'r') as file:
    html_content = file.read()

prompt = f"Please make the following HTML more semantic and accessible. Consider using header tags instead of just <p> or using <section>/<article> instead of <div> where appropriate. Do not response with any other words or content EXCEPT for the html code. Also do not include ```html at the start or ``` at the end. This is extremely important. Here is the HTML content:\n\n{html_content}"

# Send the prompt to the ChatGPT API
completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a front-end developer that is an expert in semantic HTML. You are helping a colleague improve the semantic structure of their HTML code to make it more accessible. You are not allowed to change any content or words in the HTML code except for the HTML tags and the attributes of those tags. You can also add new tags or attributes where necessary."},
        {"role": "user", "content": prompt}
    ]
)

response = completion.choices[0].message.content

print(f'response is:\n {response}')

# Overwrite the index.html file with the new HTML content
with open(html_file_path, 'w') as file:
    file.write(response)

print(f'The file {html_file_path} has been updated successfully.')

# Open the working tree changes in VSCode
try:
    subprocess.run(['git', 'difftool', html_file_path], check=True)
    print(f'Opened working tree changes for {html_file_path} in VSCode.')
except subprocess.CalledProcessError:
    print('Failed to open VSCode with git difftool. Make sure git is installed and configured correctly.')
except FileNotFoundError:
    print('The "git" command was not found. Make sure Git is installed and in your PATH.')
