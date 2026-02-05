// MongoDB Data Insertion Tool
// This tool allows the AI agent to insert data into MongoDB collections
import mongoDb from '../db/mongo.js';
import { ObjectId } from 'mongodb';

class MongoInsertTool {
    constructor() {
        this.name = 'insert_mongodb_data';
        this.description = 'Insert new documents into MongoDB collections. Can add single documents or multiple documents at once.';
        this.parameters = {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'The MongoDB collection to insert data into (e.g., users, products, orders)'
                },
                operation: {
                    type: 'string',
                    enum: ['insertOne', 'insertMany'],
                    description: 'The insert operation to perform'
                },
                data: {
                    type: ['object', 'array'],
                    description: 'The document(s) to insert. Use object for insertOne, array for insertMany'
                },
                generateId: {
                    type: 'boolean',
                    description: 'Whether to generate ObjectId for _id field automatically',
                    default: true
                }
            },
            required: ['collection', 'operation', 'data']
        };
    }

    async execute(params) {
        try {
            const { collection, operation, data, generateId = true } = params;
            
            console.log(`📝 MongoDB Insert Tool: ${operation} on ${collection}`);
            console.log('Data:', JSON.stringify(data, null, 2));

            if (!mongoDb.isConnected) {
                throw new Error('Database not connected');
            }

            const coll = mongoDb.getCollection(collection);
            let result;
            let processedData = data;

            // Process data for insertion
            if (operation === 'insertOne') {
                if (Array.isArray(data)) {
                    throw new Error('Use insertMany operation for array data');
                }
                
                // Generate ObjectId if requested and _id not provided
                if (generateId && !processedData._id) {
                    processedData = { ...processedData, _id: new ObjectId() };
                }

                result = await coll.insertOne(processedData);
                
            } else if (operation === 'insertMany') {
                if (!Array.isArray(data)) {
                    throw new Error('insertMany requires an array of documents');
                }

                if (data.length > 100) {
                    throw new Error('Cannot insert more than 100 documents at once');
                }

                // Generate ObjectIds if requested
                if (generateId) {
                    processedData = data.map(doc => 
                        doc._id ? doc : { ...doc, _id: new ObjectId() }
                    );
                }

                result = await coll.insertMany(processedData);
            } else {
                throw new Error(`Unsupported operation: ${operation}`);
            }

            console.log(`✅ Successfully inserted ${operation === 'insertOne' ? 1 : result.insertedCount} document(s)`);
            
            return {
                success: true,
                operation,
                collection,
                insertedCount: operation === 'insertOne' ? 1 : result.insertedCount,
                insertedIds: operation === 'insertOne' ? [result.insertedId] : Object.values(result.insertedIds),
                data: processedData
            };

        } catch (error) {
            console.error('❌ MongoDB Insert Tool Error:', error.message);
            return {
                success: false,
                error: error.message,
                operation: params.operation,
                collection: params.collection
            };
        }
    }

    // Helper method to get common insertion examples
    static getExampleInserts() {
        return {
            'Add single user': {
                collection: 'users',
                operation: 'insertOne',
                data: {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    age: 30,
                    role: 'Developer'
                }
            },
            'Add multiple products': {
                collection: 'products',
                operation: 'insertMany',
                data: [
                    { name: 'Laptop', price: 999.99, category: 'Electronics' },
                    { name: 'Mouse', price: 29.99, category: 'Electronics' }
                ]
            },
            'Add order with timestamp': {
                collection: 'orders',
                operation: 'insertOne',
                data: {
                    userId: 'user_001',
                    items: ['product_1', 'product_2'],
                    total: 199.99,
                    status: 'pending',
                    createdAt: new Date()
                }
            }
        };
    }
}

export default MongoInsertTool;