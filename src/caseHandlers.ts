import * as vscode from "vscode";

export function toCamelCase(
  text: string,
  previousInput: string,
  editor: vscode.TextEditor,
  event: vscode.TextDocumentChangeEvent
): string {
  // if the previous input was a space, and the current input is a letter, remove the space and return an upper case letter
  if (previousInput === " " && /^[a-zA-Z]$/.test(text)) {
    editor.edit((editBuilder) => {
      const startPosition = event.contentChanges[0].range.start.translate(
        0,
        -1
      );
      const endPosition = event.contentChanges[0].range.start.translate(0, 1);
      editBuilder.replace(
        new vscode.Range(startPosition, endPosition),
        text.toUpperCase()
      );
      return;
    });
  }

  return text;
}

export function toUpperCase(text: string): string {
  if (text === " ") {
    return "_";
  }

  return text.toUpperCase();
}

export function toKebabCase(text: string): string {
  if (text === " ") {
    return "-";
  }

  return text.toLowerCase();
}

export function toSnakeCase(text: string): string {
  if (text === " ") {
    return "_";
  }

  return text.toLowerCase();
}

export function toDotCase(text: string): string {
  if (text === " ") {
    return ".";
  }

  return text;
}
