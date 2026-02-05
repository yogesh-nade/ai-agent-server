// MongoDB Data Deletion Tool
// This tool allows the AI agent to delete data from MongoDB collections safely
import mongoDb from '../db/mongo.js';

class MongoDeleteTool {
    constructor() {
        this.name = 'delete_mongodb_data';
        this.description = 'Delete documents from MongoDB collections. Can delete single documents, multiple documents, or all documents matching criteria. Use with caution.';
        this.parameters = {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'The MongoDB collection to delete data from (e.g., users, products, orders)'
                },
                operation: {
                    type: 'string',
                    enum: ['deleteOne', 'deleteMany'],
                    description: 'The delete operation to perform'
                },
                filter: {
                    type: 'object',
                    description: 'Query filter to specify which documents to delete (MongoDB query syntax)',
                    default: {}
                },
                confirmDeletion: {
                    type: 'boolean',
                    description: 'Safety confirmation that deletion is intended',
                    default: false
                },
                safeMode: {
                    type: 'boolean',
                    description: 'If true, prevents deletion of more than 10 documents at once',
                    default: true
                }
            },
            required: ['collection', 'operation', 'filter', 'confirmDeletion']
        };
    }

    async execute(params) {
        try {
            const { collection, operation, filter = {}, confirmDeletion = false, safeMode = true } = params;
            
            console.log(`🗑️ MongoDB Delete Tool: ${operation} on ${collection}`);
            console.log('Filter:', JSON.stringify(filter, null, 2));
            console.log('Confirmation:', confirmDeletion);

            if (!mongoDb.isConnected) {
                throw new Error('Database not connected');
            }

            // Safety check - require confirmation
            if (!confirmDeletion) {
                throw new Error('Deletion requires explicit confirmation. Set confirmDeletion: true');
            }

            // Prevent accidental deletion of entire collection
            if (Object.keys(filter).length === 0) {
                throw new Error('Empty filter not allowed. To delete all documents, specify a filter like {_id: {$exists: true}}');
            }

            const coll = mongoDb.getCollection(collection);
            let result;

            // Safety check for deleteMany operations
            if (operation === 'deleteMany' && safeMode) {
                const countToDelete = await coll.countDocuments(filter);
                if (countToDelete > 10) {
                    throw new Error(`Safe mode: Cannot delete ${countToDelete} documents at once. Maximum 10 allowed. Set safeMode: false to override.`);
                }
            }

            // Pre-deletion check: find what will be deleted
            const documentsToDelete = await coll.find(filter).limit(operation === 'deleteOne' ? 1 : 100).toArray();
            
            if (documentsToDelete.length === 0) {
                return {
                    success: true,
                    operation,
                    collection,
                    deletedCount: 0,
                    message: 'No documents matched the filter criteria'
                };
            }

            // Execute deletion
            if (operation === 'deleteOne') {
                result = await coll.deleteOne(filter);
            } else if (operation === 'deleteMany') {
                result = await coll.deleteMany(filter);
            } else {
                throw new Error(`Unsupported operation: ${operation}`);
            }

            console.log(`✅ Successfully deleted ${result.deletedCount} document(s)`);
            
            return {
                success: true,
                operation,
                collection,
                deletedCount: result.deletedCount,
                documentsDeleted: documentsToDelete.slice(0, result.deletedCount),
                filter: filter
            };

        } catch (error) {
            console.error('❌ MongoDB Delete Tool Error:', error.message);
            return {
                success: false,
                error: error.message,
                operation: params.operation,
                collection: params.collection
            };
        }
    }

    // Helper method to get common deletion examples
    static getExampleDeletions() {
        return {
            'Delete user by ID': {
                collection: 'users',
                operation: 'deleteOne',
                filter: { _id: 'user_001' },
                confirmDeletion: true
            },
            'Delete inactive users': {
                collection: 'users',
                operation: 'deleteMany',
                filter: { isActive: false },
                confirmDeletion: true
            },
            'Delete old orders': {
                collection: 'orders',
                operation: 'deleteMany',
                filter: {
                    createdAt: {
                        $lt: new Date('2023-01-01')
                    }
                },
                confirmDeletion: true
            },
            'Delete user by email': {
                collection: 'users',
                operation: 'deleteOne',
                filter: { email: 'user@example.com' },
                confirmDeletion: true
            }
        };
    }
}

export default MongoDeleteTool;