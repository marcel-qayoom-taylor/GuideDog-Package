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

```bash
guidedog init
```

Initialize the accessibility configuration for your repository.

This command prompts you for your OpenAI API key and the framework you are using (React, Angular, Vue, or Other).

```bash
guidedog check [options]
```

Check the accessibility of your project, receive an rating and suggestions.

```bash
guidedog fix
```

Note: This command currently applies fixes to the entire repository. Specific file fixes will be implemented in future updates.

## Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Acknowledgements

Guidedog uses the OpenAI API for enhanced accessibility solutions. Thank you for supporting accessible web development!
