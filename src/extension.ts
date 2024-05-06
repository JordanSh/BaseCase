import * as vscode from "vscode";
import {
  toCamelCase,
  toUpperCase,
  toKebabCase,
  toSnakeCase,
  toDotCase,
} from "./caseHandlers";

// Function to handle keyboard input
function handleInput(
  text: string,
  caseStyle: string,
  previousInput: string,
  editor: vscode.TextEditor,
  event: vscode.TextDocumentChangeEvent
) {
  switch (caseStyle) {
    case "camelCase":
      return toCamelCase(text, previousInput, editor, event);
    case "UPPER_CASE":
      return toUpperCase(text);
    case "kebab-case":
      return toKebabCase(text);
    case "snake_case":
      return toSnakeCase(text);
    case "dot.case":
      return toDotCase(text);
    case "base case":
      vscode.window.showInformationMessage("Stopped using Base Case");
      disposeListeners();
      return text;
    default:
      return text;
  }
}

const changeInput = (selectedCase: string) => {
  // Dispose existing listeners
  disposeListeners();
  if (selectedCase !== "base case") {
    vscode.window.showInformationMessage(`Using ${selectedCase}`);
  }

  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("No active text editor.");
    return;
  }

  let isExtensionChange = false; // Flag to track changes made by the extension
  let inputText = "";
  let previousInput = ""; // Track previous input

  const listener = vscode.workspace.onDidChangeTextDocument((event) => {
    activeListeners.push(listener);

    if (isExtensionChange) {
      return;
    } // Ignore changes made by the extension itself

    const newText = event.contentChanges[0].text;

    // Check if the previous input was a space and the current input is also a space
    if (previousInput === " " && newText === " ") {
      editor.edit((editBuilder) => {
        const startPosition = event.contentChanges[0].range.start.translate(
          0,
          -1
        );
        const endPosition = event.contentChanges[0].range.start;
        editBuilder.replace(new vscode.Range(startPosition, endPosition), "");
      });

      vscode.window.showInformationMessage("Back to base case");
      disposeListeners();
      return;
    }

    // dispose when adding space after input
    if (previousInput === " " && newText === "=") {
      editor.edit((editBuilder) => {
        const startPosition = event.contentChanges[0].range.start.translate(
          0,
          -1
        );
        const endPosition = event.contentChanges[0].range.start;
        editBuilder.replace(new vscode.Range(startPosition, endPosition), " ");
      });

      disposeListeners();
      vscode.window.showInformationMessage("Back to base case");
      return;
    }

    // dispose when pressing enter
    // dispose when pressing "=" without space before it, but without removing the preivous char
    // useful for formats like "SOME_FORMAT=123abc-123"
    if (newText === "\n" || newText === "=") {
      disposeListeners();
      vscode.window.showInformationMessage("Back to base case");
      return;
    }

    const convertedText = handleInput(
      newText,
      selectedCase,
      previousInput,
      editor,
      event
    );

    inputText += convertedText;

    isExtensionChange = true; // Set flag to true to indicate extension-initiated change
    editor
      .edit((editBuilder) => {
        // Replace the range of the original input with an empty string
        const startPosition = event.contentChanges[0].range.start.translate(
          0,
          newText.length
        );
        const endPosition = event.contentChanges[0].range.start;
        editBuilder.replace(new vscode.Range(startPosition, endPosition), "");

        // Insert the converted text
        editBuilder.insert(event.contentChanges[0].range.start, convertedText);
      })
      .then(() => {
        isExtensionChange = false; // Reset flag after the change is applied
      });

    // Update previous input
    previousInput = newText;
  });
};

// Array to store active listeners
const activeListeners: vscode.Disposable[] = [];

// Function to dispose active listeners
function disposeListeners() {
  activeListeners.forEach((listener) => listener.dispose());
  activeListeners.length = 0; // Clear the array
}

const casesMenu: (vscode.QuickPickItem & { commandName: string })[] = [
  {
    commandName: "convertToUpperCase",
    label: "UPPER_CASE",
    description: "(⌘+B U) Constants and configuration keys",
  },
  {
    commandName: "convertToKebabCase",
    label: "kebab-case",
    description: "(⌘+B K) URLs, file names and IDs",
  },
  {
    commandName: "convertToCamelCase",
    label: "camelCase",
    description: "(⌘+B C) JavaScript variables and functions",
  },
  {
    commandName: "convertToSnakeCase",
    label: "snake_case",
    description: "(⌘+B S) Python variable and function names",
  },
  {
    commandName: "convertToDotCase",
    label: "dot.case",
    description: "(⌘+B D) File extensions and package names",
  },
  {
    commandName: "stopBaseCase",
    label: "Stop Base Case",
    description: "(⌘+B B) Stops the Base Case Extension",
  },
];

// Activate extension
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.showMenu",
    async () => {
      const selectedCase = await vscode.window.showQuickPick(casesMenu);

      if (!selectedCase) {
        return;
      }

      changeInput(selectedCase.label);
    }
  );

  context.subscriptions.push(disposable);

  casesMenu.forEach((caseStyle) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `extension.${caseStyle.commandName}`,
        () => {
          changeInput(caseStyle.label);
        }
      )
    );
  });
}

// Deactivate extension
export function deactivate() {
  // Dispose active listeners when the extension is deactivated
  disposeListeners();
}
