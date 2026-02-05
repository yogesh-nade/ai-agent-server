// LLM wrapper for OpenRouter API
// This module handles communication with OpenRouter's free LLM models
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class LLMClient {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.model = process.env.LLM_MODEL || 'qwen/qwen-2.5-72b-instruct';
        this.maxTokens = 1000;
        this.temperature = 0.7;
    }

    // Main method to send messages to the LLM
    async sendMessage(messages, tools = null) {
        try {
            const payload = {
                model: this.model,
                messages: messages,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                // Add tool support if tools are provided
                ...(tools && { 
                    tools: tools,
                    tool_choice: 'auto' 
                })
            };

            console.log('🤖 Sending request to LLM:', this.model);
            
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'AI Agent Server'
                    }
                }
            );

            const result = response.data.choices[0].message;
            console.log('✅ LLM response received');
            
            return result;
        } catch (error) {
            console.error('❌ LLM request failed:', error.response?.data || error.message);
            throw new Error(`LLM request failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    // Helper method to format tools for OpenAI format
    formatTools(toolsArray) {
        return toolsArray.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }
        }));
    }

    // Create a simple text-only conversation
    async chatCompletion(userMessage, systemPrompt = null) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }
        
        messages.push({
            role: 'user',
            content: userMessage
        });

        const response = await this.sendMessage(messages);
        return response.content;
    }

    // Chat with tool support
    async chatWithTools(messages, availableTools) {
        const formattedTools = this.formatTools(availableTools);
        return await this.sendMessage(messages, formattedTools);
    }
}

export default LLMClient;