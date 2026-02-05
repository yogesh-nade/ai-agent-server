// MongoDB Data Update Tool
// This tool allows the AI agent to update existing data in MongoDB collections
import mongoDb from '../db/mongo.js';

class MongoUpdateTool {
    constructor() {
        this.name = 'update_mongodb_data';
        this.description = 'Update existing documents in MongoDB collections. Can update single documents or multiple documents matching criteria.';
        this.parameters = {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'The MongoDB collection to update data in (e.g., users, products, orders)'
                },
                operation: {
                    type: 'string',
                    enum: ['updateOne', 'updateMany', 'replaceOne'],
                    description: 'The update operation to perform'
                },
                filter: {
                    type: 'object',
                    description: 'Query filter to specify which documents to update (MongoDB query syntax)'
                },
                update: {
                    type: 'object',
                    description: 'Update operations or replacement document (use $set, $inc, $push, etc. for updates)'
                },
                options: {
                    type: 'object',
                    description: 'Additional options like upsert, arrayFilters',
                    properties: {
                        upsert: {
                            type: 'boolean',
                            description: 'Create document if it doesn\'t exist',
                            default: false
                        }
                    },
                    default: {}
                }
            },
            required: ['collection', 'operation', 'filter', 'update']
        };
    }

    async execute(params) {
        try {
            const { collection, operation, filter, update, options = {} } = params;
            
            console.log(`✏️ MongoDB Update Tool: ${operation} on ${collection}`);
            console.log('Filter:', JSON.stringify(filter, null, 2));
            console.log('Update:', JSON.stringify(update, null, 2));

            if (!mongoDb.isConnected) {
                throw new Error('Database not connected');
            }

            // Validate filter
            if (!filter || Object.keys(filter).length === 0) {
                throw new Error('Filter is required and cannot be empty for update operations');
            }

            const coll = mongoDb.getCollection(collection);
            let result;

            // Pre-update: find documents that will be affected
            const documentsToUpdate = await coll.find(filter).limit(operation === 'updateOne' ? 1 : 100).toArray();
            
            if (documentsToUpdate.length === 0 && !options.upsert) {
                return {
                    success: true,
                    operation,
                    collection,
                    matchedCount: 0,
                    modifiedCount: 0,
                    message: 'No documents matched the filter criteria'
                };
            }

            // Execute update
            switch (operation) {
                case 'updateOne':
                    result = await coll.updateOne(filter, update, options);
                    break;
                
                case 'updateMany':
                    // Safety limit for bulk updates
                    if (documentsToUpdate.length > 50 && !options.allowBulkUpdate) {
                        throw new Error(`Attempting to update ${documentsToUpdate.length} documents. Add allowBulkUpdate: true in options to proceed.`);
                    }
                    result = await coll.updateMany(filter, update, options);
                    break;
                
                case 'replaceOne':
                    // Validate that update doesn't contain update operators for replace
                    const hasUpdateOperators = Object.keys(update).some(key => key.startsWith('$'));
                    if (hasUpdateOperators) {
                        throw new Error('replaceOne operation cannot use update operators ($set, $inc, etc.). Use updateOne instead.');
                    }
                    result = await coll.replaceOne(filter, update, options);
                    break;
                
                default:
                    throw new Error(`Unsupported operation: ${operation}`);
            }

            console.log(`✅ Matched: ${result.matchedCount}, Modified: ${result.modifiedCount} document(s)`);
            
            // Get updated documents for confirmation
            const updatedDocuments = await coll.find(filter).limit(operation === 'updateOne' ? 1 : 10).toArray();
            
            return {
                success: true,
                operation,
                collection,
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
                upsertedCount: result.upsertedCount || 0,
                upsertedId: result.upsertedId || null,
                originalDocuments: documentsToUpdate.slice(0, 10),
                updatedDocuments: updatedDocuments,
                filter: filter,
                update: update
            };

        } catch (error) {
            console.error('❌ MongoDB Update Tool Error:', error.message);
            return {
                success: false,
                error: error.message,
                operation: params.operation,
                collection: params.collection
            };
        }
    }

    // Helper method to get common update examples
    static getExampleUpdates() {
        return {
            'Update user salary': {
                collection: 'users',
                operation: 'updateOne',
                filter: { _id: 'user_001' },
                update: { $set: { salary: 95000 } }
            },
            'Add skill to user': {
                collection: 'users',
                operation: 'updateOne',
                filter: { email: 'alice.johnson@example.com' },
                update: { $push: { skills: 'Docker' } }
            },
            'Increment all prices by 10%': {
                collection: 'products',
                operation: 'updateMany',
                filter: { category: 'Electronics' },
                update: { $mul: { price: 1.1 } }
            },
            'Set all inactive users to active': {
                collection: 'users',
                operation: 'updateMany',
                filter: { isActive: false },
                update: { $set: { isActive: true, lastUpdated: new Date() } }
            },
            'Replace entire document': {
                collection: 'users',
                operation: 'replaceOne',
                filter: { _id: 'user_002' },
                update: {
                    _id: 'user_002',
                    name: 'Robert Smith',
                    email: 'robert.smith@example.com',
                    role: 'Senior Manager'
                }
            }
        };
    }
}

export default MongoUpdateTool;