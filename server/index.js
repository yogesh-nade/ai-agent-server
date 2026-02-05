// Express server - Main entry point
// This server provides the REST API for the AI agent
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoDb from './db/mongo.js';
import AIAgent from './agent.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize AI Agent
const agent = new AIAgent();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const mongoStatus = await mongoDb.ping();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                server: 'running',
                mongodb: mongoStatus ? 'connected' : 'disconnected',
                agent: 'ready'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Main chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a string'
            });
        }

        console.log('📩 New chat request:', message.substring(0, 100) + '...');

        // Process message with agent
        const result = await agent.processMessage(message, conversationId);

        // Return response
        res.json({
            success: result.success,
            response: result.response,
            conversationId: conversationId || 'default',
            timestamp: new Date().toISOString(),
            ...(result.toolsUsed && result.toolsUsed.length > 0 && {
                toolsUsed: result.toolsUsed,
                toolResults: result.toolResults
            }),
            ...(result.error && { error: result.error })
        });

    } catch (error) {
        console.error('❌ Chat endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred while processing your request',
            timestamp: new Date().toISOString()
        });
    }
});

// Get available tools
app.get('/tools', (req, res) => {
    try {
        const tools = agent.getToolInfo();
        res.json({
            success: true,
            tools: tools,
            count: Object.keys(tools).length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Clear conversation history
app.post('/clear', (req, res) => {
    try {
        agent.clearHistory();
        res.json({
            success: true,
            message: 'Conversation history cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get conversation history
app.get('/history', (req, res) => {
    try {
        const history = agent.getHistory();
        res.json({
            success: true,
            history: history,
            count: history.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test MongoDB connection
app.get('/test-db', async (req, res) => {
    try {
        const collections = await mongoDb.getDb().listCollections().toArray();
        res.json({
            success: true,
            message: 'Database connection working',
            collections: collections.map(c => c.name)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Endpoint ${req.method} ${req.path} not found`
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('📤 Received SIGTERM, shutting down gracefully...');
    await mongoDb.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('📤 Received SIGINT, shutting down gracefully...');
    await mongoDb.disconnect();
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        // Connect to MongoDB first
        await mongoDb.connect();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log('🚀 AI Agent Server started successfully!');
            console.log(`📡 Server running on http://localhost:${PORT}`);
            console.log(`🔧 Available endpoints:`);
            console.log(`   POST /chat        - Chat with the AI agent`);
            console.log(`   GET  /health      - Check server health`);
            console.log(`   GET  /tools       - List available tools`);
            console.log(`   GET  /history     - Get conversation history`);
            console.log(`   POST /clear       - Clear conversation history`);
            console.log(`   GET  /test-db     - Test MongoDB connection`);
            console.log('');
            console.log('💡 Try sending a POST request to /chat with:');
            console.log('   {"message": "How many users are in the database?"}');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();