# Git Judge

Git Judge is an advanced Git extension that rates your commits on a scale of 1 to "How drunk were you when you wrote this?" using sentiment analysis, emoji detection, and advanced heuristics.

## Features

- Evaluate commits by analyzing commit message length, punctuation, sentiment, and more.
- Displays a rating between 1 and 10.
- Show your top 10 highest rated commits with `git judge top`.

## Installation

1. Clone this repository.
2. Install dependencies with [pnpm](https://pnpm.io/):
   ```bash
   pnpm install
   ```
3. Make the script executable:
   ```bash
   chmod +x bin/git-judge.js
   ```
4. (Optional) Link the package globally for easier use:
   ```bash
   pnpm link --global
   ```

## Usage

- To evaluate the current commit:
  ```bash
  git judge
  ```
- To evaluate a specific commit:
  ```bash
  git judge <commit-hash>
  ```
- To display your top 10 highest-rated commits:
  ```bash
  git judge top
  ```

## License

This project is licensed under the MIT License.