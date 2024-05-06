# Base Case 🐍🍡🐪

## Description

The Base Case Extension for Visual Studio Code provides convenient keyboard shortcuts to convert live input into different casing styles commonly used in programming.

## Support Case Styles

- **UPPER_CASE**
- **kebab-case**
- **camelCase**
- **snake_case**
- **dot.case**

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view
3. Search for "Base Case"
4. Click Install

## Usage

- Open the Command Palette by pressing `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Select "Base Case: Show Menu" and press `Enter` to open the case styles menu
- Select the desired casing style from the menu using the arrow keys and press `Enter` to apply it
- Alternatively, use the following keyboard shortcuts:
  - **⌘+B U** (Mac) or **Ctrl+B U** (Windows): Convert input to UPPER_CASE
  - **⌘+B K** (Mac) or **Ctrl+B K** (Windows): Convert input to kebab-case
  - **⌘+B C** (Mac) or **Ctrl+B C** (Windows): Convert input to camelCase
  - **⌘+B S** (Mac) or **Ctrl+B S** (Windows): Convert input to snake_case
  - **⌘+B D** (Mac) or **Ctrl+B D** (Windows): Convert input to dot.case
  - **⌘+B B** (Mac) or **Ctrl+B B** (Windows): Stop using the Base Case Extension

After selecting the case styling, just type normally and the input will change live. For example, selecting the camelCase and typing: `some function that does calcs` will output `someFunctionThatDoesCalcs`

## Escape Characters

- Double space: Removes the previous character and stops the extension.
- Enter: Drop to new line and stops the extension.
- Space + =: Removes the previous character and stops the extension.
  - Useful for formats like `SOME_CONST = "some-id"`.
- Just =: Does not remove the previous character but still stops the extension.
  - Useful for formats like `SOME_FORMAT=some-id`.

## Supported Platforms

The Base Case Extension supports both Windows and macOS.

## Contributing

Contributions are welcome! If you encounter any bugs or have suggestions for new features, please open an issue on the [GitHub repository](https://github.com/JordanSh/BaseCase).

## License

This project is licensed under the [MIT License](https://github.com/JordanSh/BaseCase/blob/main/LICENSE.md)
