// MongoDB Data Extractor Tool
// This tool allows the AI agent to query MongoDB collections
import mongoDb from '../db/mongo.js';

class MongoTool {
    constructor() {
        this.name = 'fetch_mongodb_data';
        this.description = 'Fetch data from MongoDB collections. Can find users, get collection stats, or query specific documents.';
        this.parameters = {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'The MongoDB collection to query (e.g., users, products, orders)'
                },
                operation: {
                    type: 'string',
                    enum: ['find', 'findOne', 'count', 'distinct', 'aggregate'],
                    description: 'The operation to perform'
                },
                query: {
                    type: 'object',
                    description: 'Query filter object (MongoDB query syntax)',
                    default: {}
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of documents to return (for find operations)',
                    default: 10,
                    maximum: 100
                },
                fields: {
                    type: 'object',
                    description: 'Fields to include/exclude in results (MongoDB projection)',
                    default: {}
                }
            },
            required: ['collection', 'operation']
        };
    }

    async execute(params) {
        try {
            const { collection, operation, query = {}, limit = 10, fields = {} } = params;
            
            console.log(`🔍 MongoDB Tool: ${operation} on ${collection}`);
            console.log('Query:', JSON.stringify(query, null, 2));

            if (!mongoDb.isConnected) {
                throw new Error('Database not connected');
            }

            const coll = mongoDb.getCollection(collection);
            let result;

            switch (operation) {
                case 'find':
                    result = await coll.find(query)
                        .project(fields)
                        .limit(Math.min(limit, 100))
                        .toArray();
                    break;
                
                case 'findOne':
                    result = await coll.findOne(query, { projection: fields });
                    break;
                
                case 'count':
                    result = await coll.countDocuments(query);
                    break;
                
                case 'distinct':
                    if (!params.field) {
                        throw new Error('Field parameter required for distinct operation');
                    }
                    result = await coll.distinct(params.field, query);
                    break;
                
                case 'aggregate':
                    if (!Array.isArray(query)) {
                        throw new Error('Query must be an aggregation pipeline array for aggregate operation');
                    }
                    result = await coll.aggregate(query).limit(limit).toArray();
                    break;
                
                default:
                    throw new Error(`Unsupported operation: ${operation}`);
            }

            console.log(`✅ Found ${Array.isArray(result) ? result.length : 1} result(s)`);
            
            return {
                success: true,
                operation,
                collection,
                count: Array.isArray(result) ? result.length : (result ? 1 : 0),
                data: result
            };

        } catch (error) {
            console.error('❌ MongoDB Tool Error:', error.message);
            return {
                success: false,
                error: error.message,
                operation: params.operation,
                collection: params.collection
            };
        }
    }

    // Helper method to get common queries
    static getExampleQueries() {
        return {
            'Get all users': {
                collection: 'users',
                operation: 'find',
                query: {},
                limit: 10
            },
            'Find user by email': {
                collection: 'users',
                operation: 'findOne',
                query: { email: 'user@example.com' }
            },
            'Count total users': {
                collection: 'users',
                operation: 'count',
                query: {}
            },
            'Get users created this year': {
                collection: 'users',
                operation: 'find',
                query: {
                    createdAt: {
                        $gte: new Date('2024-01-01')
                    }
                }
            }
        };
    }
}

export default MongoTool;