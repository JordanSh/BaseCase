import * as vscode from "vscode";

function toCamelCase(
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

function toUpperCase(text: string): string {
  return text.toUpperCase();
}

function toScreamingCase(text: string): string {
  if (text === " ") {
    return "_";
  }

  return text.toUpperCase();
}

function toKebabCase(text: string): string {
  if (text === " ") {
    return "-";
  }

  return text.toLowerCase();
}

function toSnakeCase(text: string): string {
  if (text === " ") {
    return "_";
  }

  return text.toLowerCase();
}

function toDotCase(text: string): string {
  if (text === " ") {
    return ".";
  }

  return text;
}

function toBaseCase(text: string): string {
  return text;
}

// Function to handle keyboard input
function handleInput(
  text: string,
  caseStyle: string,
  previousInput: string,
  editor: vscode.TextEditor,
  event: vscode.TextDocumentChangeEvent
): string {
  switch (caseStyle) {
    case "camelCase":
      return toCamelCase(text, previousInput, editor, event);
    case "UPPERCASE":
      return toUpperCase(text);
    case "SCREAMING_CASE":
      return toScreamingCase(text);
    case "kebab-case":
      return toKebabCase(text);
    case "snake_case":
      return toSnakeCase(text);
    case "dot.case":
      return toDotCase(text);
    case "base case":
      return toBaseCase(text);
    default:
      return text;
  }
}

// Activate extension
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.showMenu",
    async () => {
      const menuItems: vscode.QuickPickItem[] = [
        {
          label: "SCREAMING_CASE",
          description: "Commonly used for constants and configuration keys",
        },
        {
          label: "kebab-case",
          description: "Commonly used in URLs, file names and IDs",
        },
        {
          label: "camelCase",
          description:
            "Commonly used in JavaScript for variables and functions",
        },
        {
          label: "snake_case",
          description:
            "Commonly used in Python for variable and function names",
        },
        {
          label: "dot.case",
          description: "Commonly used in file extensions and package names",
        },
        {
          label: "UPPERCASE",
          description: "Commonly used for constants and enum values",
        },
      ];

      const selectedCase = await vscode.window.showQuickPick(menuItems);

      if (!selectedCase) {
        return;
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
            editBuilder.replace(
              new vscode.Range(startPosition, endPosition),
              ""
            );
          });

          vscode.window.showInformationMessage("Back to base case");
          listener.dispose();
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
            editBuilder.replace(
              new vscode.Range(startPosition, endPosition),
              " "
            );
          });

          vscode.window.showInformationMessage("Back to base case");
          listener.dispose();
          return;
        }

        // dispose when pressing enter
        // dispose when pressing "=" without space before it, but without removing the preivous char
        // useful for formats like "SOME_FORMAT=123abc-123"
        if (newText === "\n" || newText === "=") {
          vscode.window.showInformationMessage("Back to base case");
          listener.dispose();
          return;
        }

        const convertedText = handleInput(
          newText,
          selectedCase.label,
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
            editBuilder.replace(
              new vscode.Range(startPosition, endPosition),
              ""
            );

            // Insert the converted text
            editBuilder.insert(
              event.contentChanges[0].range.start,
              convertedText
            );
          })
          .then(() => {
            isExtensionChange = false; // Reset flag after the change is applied
          });

        // Update previous input
        previousInput = newText;
      });
    }
  );

  context.subscriptions.push(disposable);

  //   // Register the command
  //   context.subscriptions.push(
  //     vscode.commands.registerCommand("extension.showMenu", () => {
  //       vscode.commands.executeCommand("extension.convertText");
  //     })
  //   );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.camelCase", () => {
      // Handle camelCase command
      console.log("test");

      // handleCaseCommand("camelCase");
    })
  );
}

// Deactivate extension
export function deactivate() {}
