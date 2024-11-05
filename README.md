# GuideDog

## Overview

GuideDog is a AI-powered code library that helps web-developers ensure their code meets web accessibility standards automatically.

## Features

- **Initialize Accessibility Config**: Set up accessibility configurations tailored to your project.
- **Check Accessibility**: Analyze your project for potential accessibility issues, receive suggestions and reports.
- **Fix Accessibility Issues**: Automatically address accessibility problems within your code.

## Installation

You can install Guidedog using npm:

```bash
npm install guidedog
```

## Usage

### Command Line Interface

You can interact with Guidedog through the command line. Below are the available commands:

#### Init

```bash
guidedog init [options]
```

Initialize the accessibility configuration for your repository and prompts you for your OpenAI API key.

Optional flags:

--apiKey "key": Adds the API key automatically (if not provided, will use .env or prompt user)

#### Check

```bash
guidedog check
```

Check the accessibility of your project, receive an rating and suggestions.

#### Fix

```bash
guidedog fix [options]
```

Apply fixes to your codebase. 

Optional flags:

--wholeRepo: Applies fixes to the entire repository

--file "fileName": Applies fixes only to the specified file


## Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Acknowledgements

Guidedog uses the OpenAI API for enhanced accessibility solutions. Thank you for supporting accessible web development!
