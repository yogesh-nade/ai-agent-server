// Agent reasoning and tool execution
// This is the core agent that handles LLM interactions and tool calling
import LLMClient from './llm.js';
import MongoTool from './tools/mongoTool.js';

class AIAgent {
    constructor() {
        this.llm = new LLMClient();
        this.tools = new Map();
        this.conversationHistory = [];
        
        // Register available tools
        this.registerTool(new MongoTool());
        
        console.log('🤖 AI Agent initialized with tools:', Array.from(this.tools.keys()));
    }

    // Register a new tool
    registerTool(tool) {
        this.tools.set(tool.name, tool);
        console.log(`🔧 Registered tool: ${tool.name}`);
    }

    // Get all available tools in OpenAI format
    getAvailableTools() {
        return Array.from(this.tools.values());
    }

    // Main method to process user messages
    async processMessage(userMessage, conversationId = 'default') {
        try {
            console.log('💭 Processing user message:', userMessage);

            // Add user message to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            // System prompt to guide the agent behavior
            const systemPrompt = `You are a helpful AI agent with access to MongoDB data tools. 
You can help users query databases, find information, and provide insights.

Available tools:
- fetch_mongodb_data: Query MongoDB collections to find users, count records, or get specific data

When users ask about data, users in the database, or want to query information, use the MongoDB tool.
Be helpful and explain what you found in a clear, human-friendly way.
Always be concise but informative in your responses.`;

            // Prepare messages with system prompt
            const messages = [
                { role: 'system', content: systemPrompt },
                ...this.conversationHistory
            ];

            // Get LLM response with tool support
            const response = await this.llm.chatWithTools(messages, this.getAvailableTools());

            // Check if LLM wants to use tools
            if (response.tool_calls && response.tool_calls.length > 0) {
                console.log('🛠️ LLM requested tool calls:', response.tool_calls.length);
                
                // Execute tool calls
                const toolResults = await this.executeToolCalls(response.tool_calls);
                
                // Add tool results to conversation
                this.conversationHistory.push({
                    role: 'assistant',
                    content: response.content || '',
                    tool_calls: response.tool_calls
                });

                // Add tool results
                for (const toolResult of toolResults) {
                    this.conversationHistory.push({
                        role: 'tool',
                        content: JSON.stringify(toolResult.result),
                        tool_call_id: toolResult.tool_call_id
                    });
                }

                // Get final response from LLM with tool results
                const finalMessages = [
                    { role: 'system', content: systemPrompt + '\n\nBased on the tool results, provide a helpful response to the user.' },
                    ...this.conversationHistory
                ];

                const finalResponse = await this.llm.sendMessage(finalMessages);
                
                // Add final response to history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: finalResponse.content
                });

                return {
                    success: true,
                    response: finalResponse.content,
                    toolsUsed: response.tool_calls.map(tc => tc.function.name),
                    toolResults: toolResults.map(tr => tr.result)
                };
            } else {
                // No tools needed, return direct response
                console.log('💬 Direct LLM response (no tools)');
                
                this.conversationHistory.push({
                    role: 'assistant',
                    content: response.content
                });

                return {
                    success: true,
                    response: response.content,
                    toolsUsed: [],
                    toolResults: []
                };
            }

        } catch (error) {
            console.error('❌ Agent processing error:', error.message);
            return {
                success: false,
                error: error.message,
                response: 'Sorry, I encountered an error while processing your request.'
            };
        }
    }

    // Execute tool calls requested by the LLM
    async executeToolCalls(toolCalls) {
        const results = [];

        for (const toolCall of toolCalls) {
            try {
                const toolName = toolCall.function.name;
                const toolParams = JSON.parse(toolCall.function.arguments);
                
                console.log(`⚡ Executing tool: ${toolName}`);
                console.log('Parameters:', toolParams);

                if (!this.tools.has(toolName)) {
                    throw new Error(`Unknown tool: ${toolName}`);
                }

                const tool = this.tools.get(toolName);
                const result = await tool.execute(toolParams);

                results.push({
                    tool_call_id: toolCall.id,
                    tool_name: toolName,
                    result: result
                });

                console.log(`✅ Tool ${toolName} completed`);

            } catch (error) {
                console.error(`❌ Tool execution error (${toolCall.function.name}):`, error.message);
                results.push({
                    tool_call_id: toolCall.id,
                    tool_name: toolCall.function.name,
                    result: { 
                        success: false, 
                        error: error.message 
                    }
                });
            }
        }

        return results;
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        console.log('🗑️ Conversation history cleared');
    }

    // Get conversation history
    getHistory() {
        return [...this.conversationHistory];
    }

    // Get available tool names and descriptions
    getToolInfo() {
        const toolInfo = {};
        for (const [name, tool] of this.tools) {
            toolInfo[name] = {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            };
        }
        return toolInfo;
    }
}

export default AIAgent;