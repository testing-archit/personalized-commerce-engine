# Intelligent Shopping Assistant

An AI-powered shopping assistant that helps users find products on Amazon using natural language interviews and intelligent search.

## Features

- **Gemini-Powered Interview**: Asks qualifying questions to understand user needs using Google's Gemini AI.
- **Intelligent Keyword Generation**: Converts user answers into targeted Amazon search keywords.
- **Real-Time Amazon Search**: Uses RapidAPI's Real-Time Amazon Data API to fetch live product data.
- **Vercel Ready**: Configured for easy deployment on Vercel.

## Prerequisites

- Node.js (v18+)
- Google Gemini API Key
- RapidAPI Key (Real-Time Amazon Data API)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personalized-commerce-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Open `.env` and fill in your keys:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Running Locally

Start the development server:
```bash
npm start
# OR directly:
node server.js
```

The server will run on `http://localhost:3333`.

### 💬 Use the Chat Interface (New!)
Open **[http://localhost:3333](http://localhost:3333)** in your browser to use the AI Chat Assistant.

### API Endpoints

- **Start Interview**
  ```bash
  POST /mcp/gemini/interview/start
  { "initialQuery": "I need a laptop for coding" }
  ```

- **Process Answers & Search**
  ```bash
  POST /mcp/gemini/interview/process
  { "answers": ["I need 16GB RAM", "Budget under $1000"] }
  ```

- **Direct Search**
  ```bash
  POST /mcp/amazon/search
  { "query": "macbook air m2" }
  ```

## Deployment

This project is configured for **Vercel**.

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Add your Environment Variables in the Vercel Dashboard project settings.
