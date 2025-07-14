module.exports = {
    arrowParens: "always",
    printWidth: 100,
    quoteProps: "consistent",
    semi: false,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: "es5",
    overrides: [
      {
        "files": ["*.json", "*.yml", "*.md"],
        "options": {
          "tabWidth": 2
        }
      },
      {
        "files": "*.{ts,tsx}",
        "options": {
          "parser": "typescript"
        }
      }
    ],
    endOfLine: 'auto'
};