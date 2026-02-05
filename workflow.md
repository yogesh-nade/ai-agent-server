# AI Agent Development Workflow

This document outlines all the steps followed to create the AI Agent server from scratch.

## 📋 Project Overview
Created a simple AI agent using Node.js, Express, and MongoDB with OpenRouter free LLM integration (Qwen 72B / Llama 72B).

## 🛠️ Development Steps

### Step 1: Project Setup and Structure
- **Created directory structure** following the specified architecture:
  ```
  server/
  ├── index.js        // Express server
  ├── agent.js        // Agent reasoning + tool execution  
  ├── llm.js          // LLM wrapper
  ├── tools/
  │   └── mongoTool.js // MongoDB data extractor tool
  └── db/
      └── mongo.js     // MongoDB connection
  ```

### Step 2: Package Configuration
- **Created `package.json`** with:
  - ES modules support (`"type": "module"`)
  - Required dependencies: express, mongodb, axios, cors, dotenv
  - Start scripts for development and production
  
- **Created `.env` file** with:
  - OpenRouter API key configuration
  - MongoDB connection string
  - Default LLM model (Qwen 2.5 72B Instruct)
  - Server port configuration

### Step 3: Database Layer (db/mongo.js)
- **Created MongoDB connection module** with:
  - Singleton pattern for database connection
  - Connection management (connect/disconnect)
  - Health check functionality
  - Helper methods for collection access
  - Error handling and logging

**Purpose**: Centralized database connectivity and utilities

### Step 4: LLM Integration (llm.js)
- **Created OpenRouter LLM wrapper** with:
  - OpenRouter API integration for free models
  - Support for both Qwen 70B and Llama 72B models
  - Tool calling functionality (OpenAI format)
  - Conversation management
  - Error handling and rate limiting awareness

**Purpose**: Abstracted LLM communication with tool support

### Step 5: Tool System (tools/mongoTool.js)
- **Created MongoDB data extractor tool** with:
  - MCP-inspired tool structure (name, description, parameters, execute)
  - Multiple operations: find, findOne, count, distinct, aggregate
  - JSON schema for parameter validation
  - Safety limits (max 100 documents)
  - Comprehensive error handling

**Purpose**: Allows AI agent to query MongoDB collections safely

### Step 6: Agent Core Logic (agent.js)
- **Created AI agent with reasoning capabilities**:
  - Tool registration system
  - Conversation history management
  - Tool execution workflow
  - LLM response processing
  - System prompts for guidance
  - Multi-turn conversations with tool results

**Purpose**: Core intelligence that orchestrates LLM and tools

### Step 7: Express API Server (index.js)
- **Created REST API server** with:
  - `/chat` endpoint for user interactions
  - `/health` endpoint for system monitoring
  - `/tools` endpoint to list available tools
  - `/history` and `/clear` for conversation management
  - `/test-db` for database connectivity testing
  - Comprehensive error handling and logging
  - Graceful shutdown procedures

**Purpose**: HTTP interface for the AI agent

## 🔧 Key Features Implemented

### 1. **Tool Calling System**
- OpenAI-compatible function calling
- Automatic tool execution based on LLM requests
- Tool result integration back to LLM for final response

### 2. **MongoDB Integration**
- Safe database queries with limits
- Multiple query operations
- JSON schema validation

### 3. **Conversation Management**
- Persistent conversation history
- Context-aware responses
- Multi-turn tool interactions

### 4. **Error Handling**
- Comprehensive error catching at all levels
- Graceful degradation
- Informative error messages

### 5. **Free LLM Support**
- OpenRouter integration for free models
- Configurable model selection
- Rate limiting considerations

## 📁 File Purposes Explained

| File | Purpose |
|------|---------|
| **`index.js`** | Main Express server providing REST API endpoints |
| **`agent.js`** | Core AI agent logic, handles LLM interactions and tool orchestration |
| **`llm.js`** | OpenRouter API wrapper for free LLM models with tool support |
| **`db/mongo.js`** | MongoDB connection and database utilities |
| **`tools/mongoTool.js`** | MongoDB data extraction tool for the agent |
| **`package.json`** | Node.js dependencies and project configuration |
| **`.env`** | Environment variables for API keys and configuration |

## 🚀 Next Steps for Usage

### 1. **Install Dependencies**
```bash
cd Agent0
npm install
```

### 2. **Configure Environment**
- Get free OpenRouter API key from [openrouter.ai](https://openrouter.ai)
- Set up MongoDB (local or cloud)
- Update `.env` file with your credentials

### 3. **Start the Server**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. **Test the Agent**
Send POST request to `http://localhost:3000/chat`:
```json
{
  "message": "How many users are in the database?"
}
```

## 🎯 Learning Objectives Achieved

1. ✅ **Simple Architecture**: Clean, understandable code structure
2. ✅ **MCP-Inspired Tools**: Function calling system similar to Model Context Protocol
3. ✅ **Modern JavaScript**: ES modules throughout
4. ✅ **Free LLM Integration**: OpenRouter with Qwen/Llama models
5. ✅ **Beginner-Friendly**: Well-commented, logical flow
6. ✅ **Production-Ready Basics**: Error handling, logging, graceful shutdown

## 🔮 Future Enhancements
- Add more tools (file system, web scraping, calculations)
- Implement streaming responses
- Add authentication and rate limiting
- Create a web frontend
- Add conversation persistence to database
- Implement tool result caching

---

*This workflow demonstrates building an AI agent from scratch with modern JavaScript, free LLM integration, and a tool system inspired by MCP architecture.*