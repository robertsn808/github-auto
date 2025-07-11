# AI GitHub Automation System

This project has been refactored to improve maintainability, readability, and reusability. The original monolithic `automate` file has been broken down into a more modular structure using React components and custom hooks.

## Project Structure

```
src/
├── components/
│   ├── AIGitHubAutomation.jsx
│   ├── AnalysisSection.jsx
│   ├── AutomationHistorySection.jsx
│   ├── SettingsSection.jsx
│   └── StatisticsSection.jsx
└── hooks/
    ├── useAutomationActions.js
    ├── useAutomationHistory.js
    ├── useGitHubApi.js
    └── useNotifications.js
```

### `src/components/`

-   **`AIGitHubAutomation.jsx`**: The main application component. It orchestrates the different sections and manages the top-level state and logic, importing custom hooks and sub-components.
-   **`AnalysisSection.jsx`**: Handles the repository URL and GitHub token input, triggers analysis, and displays the detailed analysis results (bugs, improvements, features, security concerns, etc.). It also provides buttons for bulk automation actions.
-   **`AutomationHistorySection.jsx`**: Displays a chronological list of all automation actions performed, including details like repository, action type, status, and relevant metadata.
-   **`SettingsSection.jsx`**: Provides a user interface for configuring various automation settings, such as enabling/disabling auto-fix, setting limits for bulk actions, and defining code review modes.
-   **`StatisticsSection.jsx`**: Presents a summary of automation statistics, including total actions, number of bug fixes, improvements, features developed, and analyses performed.

### `src/hooks/`

-   **`useAutomationActions.js`**: Contains the core logic for performing AI-powered automation actions, such as `analyzeRepository`, `executeBugFix`, `executeImprovement`, and `developFeature`. It encapsulates the interaction with the AI model and integrates with GitHub API functions.
-   **`useAutomationHistory.js`**: Manages the state and logic related to the automation history, including adding new entries and calculating statistics based on the history.
-   **`useGitHubApi.js`**: Provides utility functions for interacting with the GitHub API, such as fetching repository data, analyzing repository structure, and cleaning AI responses. It centralizes all GitHub-related API calls.
-   **`useNotifications.js`**: Offers a simple notification system to display success, error, or warning messages to the user.

## How to Use

1.  **Clone the repository** (once available).
2.  **Install dependencies**: Navigate to the project root and run `npm install` or `yarn install`.
3.  **Run the application**: Start the development server with `npm start` or `yarn start`.
4.  **Provide GitHub Details**: In the application, enter your GitHub Repository URL and a Personal Access Token (PAT) with appropriate permissions.
5.  **Start Analysis**: Click "Start Comprehensive Analysis" to get an AI-powered assessment of your repository.
6.  **Automate**: Based on the analysis, you can choose to auto-fix bugs, implement improvements, or develop features.

This modular structure makes the application easier to understand, debug, and extend in the future. Each part has a clear responsibility, leading to a more robust and scalable system.

