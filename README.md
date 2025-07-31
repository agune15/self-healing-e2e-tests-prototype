# Self-Healing E2E Tests Prototype

A proof-of-concept implementation demonstrating how Large Language Models (LLMs) can automatically analyze and fix failing end-to-end tests, reducing manual maintenance efforts in test automation.

## 🔧 Key Features

- **AI-Powered Test Analysis**: Uses Google Gemini to analyze test failures and DOM snapshots
- **Automatic Fix Suggestions**: Generates code fixes for common test failures (selector changes, timing issues, etc.)
- **Automated PR Creation**: Creates pull requests with proposed fixes for review
- **Cypress Integration**: Built on Cypress testing framework with comprehensive reporting
- **Snapshot-Based Analysis**: Captures HTML snapshots for precise failure analysis

## 🚀 Technologies Used

- **Cypress** - E2E testing framework
- **Google Gemini AI** - Test failure analysis and fix generation
- **Node.js** - Automation scripts and AI integration
- **Mochawesome** - Test reporting and result visualization

## 📋 Prerequisites

- Node.js (v14 or higher)
- Google Gemini API key

## 🛠 Installation

```bash
npm install
```

Set up your environment variables:
```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

## 🎯 Usage

### Run Tests
```bash
# Open Cypress GUI
npm run cy:open

# Run tests headlessly
npm run cy:run
```

### Generate Reports
```bash
npm run reports
```

### AI Analysis & Self-Healing
```bash
# Analyze test failures with AI
npm run llm:analyze-failures

# Create PR with suggested fixes
npm run llm:create-pr
```

## 🤖 How It Works

1. **Test Execution**: Cypress runs E2E tests and captures failures with HTML snapshots
2. **AI Analysis**: Gemini analyzes failure logs, test code, and DOM snapshots to identify issues
3. **Fix Generation**: AI suggests code changes to resolve common problems (updated selectors, timing adjustments, etc.)
4. **Automated PR**: Creates pull request with proposed fixes for team review
5. **Continuous Learning**: Improves over time as it encounters more failure patterns

## 📁 Project Structure

```
├── cypress/e2e/           # Test files
├── cypress/support/       # Helper functions and commands
├── scripts/               # AI analysis and automation scripts
├── reports/               # Test reports and snapshots
└── README.md             # This file
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

*This project demonstrates the potential of AI-assisted test maintenance, reducing the manual effort required to keep E2E tests stable as applications evolve.*
