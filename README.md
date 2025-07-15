# Partridge Tiling Puzzle Solver

An interactive React application for solving tiling puzzles inspired by the Jane Street June 2025 Puzzle. Drag and drop different sized squares onto a grid board to solve the puzzle.

## Live Demo

**[View Live Demo Here](https://giovannivitale4722.github.io/Partridge-tiling-puzzle/)** 

## Features

- 🎯 **Drag & Drop Interface**: Intuitive drag and drop from toolbar to board
- 🟢 **Visual Feedback**: Green preview for valid placements, red for invalid
- 🔒 **Lock Mechanism**: Double-click squares to lock them in place
- 🖱️ **Right-click Removal**: Easy square removal with right-click
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Beautiful purple gradient theme with smooth animations
- 📊 **Analytics**: Built-in analytics tracking with Vercel Analytics

## Game Rules

- Drag squares from the inventory (right panel) to the game board
- Each square size (1x1 to 9x9) has a limited quantity
- Squares cannot overlap
- Right-click placed squares to remove them
- Double-click squares to lock/unlock them
- Green preview shows valid placement, red shows invalid

## Getting Started

### Prerequisites

- Node.js (version 16 or higher is recommended for modern React/Vite projects)
- npm or yarn package manager

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/giovannivitale4722/partridge-tiling-puzzle.git](https://github.com/giovannivitale4722/partridge-tiling-puzzle.git)
    cd partridge-tiling-puzzle
    ```
    *(Added cloning instructions as this is the first step for a new user)*

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:3000`

### Available Scripts

-   `npm run dev` - Start development server for local development with hot-reloading.
-   `npm run build` - Compiles the project for production, optimizing assets into the `dist` directory.
-   `npm run preview` - Serves the production build locally for testing before deployment.
-   `npm run lint` - Runs ESLint to check for code quality and style issues.
-   `npm run deploy` - Builds the project and deploys it to GitHub Pages using `gh-pages`. *(Added the deploy script, as it's crucial for your project)*

### Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

1.  Ensure your `homepage` field in `package.json` and `base` field in `vite.config.ts` are correctly set to your GitHub Pages URL (e.g., `https://giovannivitale4722.github.io/partridge-tiling-puzzle/`).
2.  Run the deploy script:
    ```bash
    npm run deploy
    ```
    This command will first build your application (`npm run build` via `predeploy` script) and then push the contents of the `dist` directory to the `gh-pages` branch of your repository. Your site will then be live at the `homepage` URL.

## Technology Stack

-   **React 18** - UI framework
-   **TypeScript** - Type safety
-   **Vite** - Fast build tool and development server
-   **CSS3** - Styling with custom properties for a modern look and feel
-   **Vercel Analytics** - For anonymous usage analytics
