import * as fs from 'fs';
import * as path from 'path';

interface Suggestion {
    Filename: string;
    'suggestion line number': number;
    'type of accessibility issue': string;
    'suggested code improvement': string;
}

function applySuggestion(suggestion: Suggestion): void {
    const { Filename, 'suggestion line number': lineNumber, 'suggested code improvement': improvement } = suggestion;

    const filePath = path.resolve(suggestion.Filename);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${Filename}`);
        return;
    }

    let fileContent: string = fs.readFileSync(filePath, 'utf-8');
    const fileLines: string[] = fileContent.split('\n');

    if (lineNumber - 1 >= fileLines.length) {
        console.error(`Line number ${lineNumber} out of range for file ${Filename}`);
        return;
    }

    fileLines[lineNumber - 1] = improvement;

    fileContent = fileLines.join('\n');
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    console.log(`Updated line ${lineNumber} in ${Filename}`);
}

export async function applyAllSuggestions(suggestionJson: string){
    const suggestions: Suggestion[] = JSON.parse(suggestionJson);
    
    suggestions.forEach((suggestion) => {
        applySuggestion(suggestion);
    });
}

export async function applySingleSuggestion(index: number, suggestionJson: string){
    console.log("applyallsuggestions")
    const suggestions: Suggestion[] = JSON.parse(suggestionJson);

    if (index >= 0 && index < suggestions.length) {
        applySuggestion(suggestions[index]!);
    } else {
        console.log('Invalid suggestion index');
    }
}