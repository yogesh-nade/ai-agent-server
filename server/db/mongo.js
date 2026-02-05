// MongoDB connection and utilities
// This module handles database connectivity and provides basic operations
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class MongoDatabase {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            console.log('Connecting to MongoDB...');
            this.client = new MongoClient(process.env.MONGO_URI);
            await this.client.connect();
            this.db = this.client.db();
            this.isConnected = true;
            console.log('✅ Connected to MongoDB successfully');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            console.log('📤 Disconnected from MongoDB');
        }
    }

    getDb() {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }

    // Helper method to get a collection
    getCollection(collectionName) {
        return this.getDb().collection(collectionName);
    }

    // Basic health check
    async ping() {
        try {
            await this.client.db().admin().ping();
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Export a singleton instance
export const mongoDb = new MongoDatabase();
export default mongoDb;