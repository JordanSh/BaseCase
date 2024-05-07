import * as vscode from "vscode";
import {
  toCamelCase,
  toUpperCase,
  toKebabCase,
  toSnakeCase,
  toDotCase,
} from "./caseHandlers";

const os = require("os");
const cmdKey = os.platform() === "win32" ? "Ctrl" : "⌘";

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
  // dispose existing listeners
  disposeListeners();

  if (selectedCase !== "base case") {
    vscode.window.showInformationMessage(`Using ${selectedCase}`);
  }

  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("No active text editor.");
    return;
  }

  let isExtensionChange = false; // flag to track changes made by the extension
  let inputText = "";
  let previousInput = "";

  const listener = vscode.workspace.onDidChangeTextDocument((event) => {
    activeListeners.push(listener);

    if (isExtensionChange) {
      return;
    } // prevents infinite extension usage

    const newText = event.contentChanges[0].text;

    // dispose on double space and remove the previous space
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
    // useful for formats like "SOME_CONST=123123"
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

    isExtensionChange = true; // set flag to true to indicate extension-initiated change
    editor
      .edit((editBuilder) => {
        // replace the range of the original input with an empty string
        const startPosition = event.contentChanges[0].range.start.translate(
          0,
          newText.length
        );
        const endPosition = event.contentChanges[0].range.start;
        editBuilder.replace(new vscode.Range(startPosition, endPosition), "");

        // insert the converted text
        editBuilder.insert(event.contentChanges[0].range.start, convertedText);
      })
      .then(() => {
        isExtensionChange = false; // reset flag after the change is applied
      });

    // update previous input
    previousInput = newText;
  });
};

// array to store active listeners
const activeListeners: vscode.Disposable[] = [];

// function to dispose active listeners
function disposeListeners() {
  activeListeners.forEach((listener) => listener.dispose());
  activeListeners.length = 0;
}

const casesMenu: (vscode.QuickPickItem & { commandName: string })[] = [
  {
    commandName: "convertToUpperCase",
    label: "UPPER_CASE",
    description: `(${cmdKey}+B U) Constants and configuration keys`,
  },
  {
    commandName: "convertToKebabCase",
    label: "kebab-case",
    description: `(${cmdKey}+B K) URLs, file names and IDs`,
  },
  {
    commandName: "convertToCamelCase",
    label: "camelCase",
    description: `(${cmdKey}+B C) JavaScript variables and functions`,
  },
  {
    commandName: "convertToSnakeCase",
    label: "snake_case",
    description: `(${cmdKey}+B S) Python variable and function names`,
  },
  {
    commandName: "convertToDotCase",
    label: "dot.case",
    description: `(${cmdKey}+B D) File extensions and package names`,
  },
  {
    commandName: "stopBaseCase",
    label: "Stop Base Case",
    description: `(${cmdKey}+B B) Stops the Base Case Extension`,
  },
];

// activate extension
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

// deactivate extension
export function deactivate() {
  // dispose active listeners when the extension is deactivated
  disposeListeners();
}
