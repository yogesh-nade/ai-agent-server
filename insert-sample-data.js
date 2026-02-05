// Sample data to insert into MongoDB
// Run this script to populate your database with test users
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const sampleUsers = [
    {
        _id: "user_001",
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        age: 28,
        role: "Software Engineer",
        department: "Engineering",
        salary: 85000,
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        location: {
            city: "San Francisco",
            state: "CA",
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2022-03-15"),
        lastLogin: new Date("2024-02-04"),
        projects: ["AI Agent", "Web Dashboard", "Mobile App"]
    },
    {
        _id: "user_002", 
        name: "Bob Smith",
        email: "bob.smith@example.com",
        age: 34,
        role: "Product Manager",
        department: "Product",
        salary: 95000,
        skills: ["Project Management", "Agile", "Analytics", "Leadership"],
        location: {
            city: "New York",
            state: "NY", 
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2021-08-20"),
        lastLogin: new Date("2024-02-05"),
        projects: ["Product Roadmap", "User Research", "Feature Planning"]
    },
    {
        _id: "user_003",
        name: "Carol Davis",
        email: "carol.davis@example.com", 
        age: 31,
        role: "Data Scientist",
        department: "Data",
        salary: 92000,
        skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Statistics"],
        location: {
            city: "Austin",
            state: "TX",
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2020-11-10"),
        lastLogin: new Date("2024-02-03"),
        projects: ["ML Pipeline", "Data Analytics", "Predictive Models"]
    },
    {
        _id: "user_004",
        name: "David Wilson",
        email: "david.wilson@example.com",
        age: 26,
        role: "Frontend Developer", 
        department: "Engineering",
        salary: 75000,
        skills: ["HTML", "CSS", "JavaScript", "Vue.js", "TypeScript"],
        location: {
            city: "Seattle",
            state: "WA",
            country: "USA"
        },
        isActive: false,
        joinDate: new Date("2023-01-05"),
        lastLogin: new Date("2023-12-15"),
        projects: ["UI Components", "Landing Pages"]
    },
    {
        _id: "user_005",
        name: "Emma Brown",
        email: "emma.brown@example.com",
        age: 29,
        role: "DevOps Engineer",
        department: "Engineering", 
        salary: 88000,
        skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
        location: {
            city: "Denver",
            state: "CO",
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2021-06-18"),
        lastLogin: new Date("2024-02-05"),
        projects: ["Infrastructure", "Deployment Pipeline", "Monitoring"]
    },
    {
        _id: "user_006",
        name: "Frank Garcia", 
        email: "frank.garcia@example.com",
        age: 37,
        role: "Senior Backend Developer",
        department: "Engineering",
        salary: 105000,
        skills: ["Java", "Spring", "PostgreSQL", "Redis", "Microservices"],
        location: {
            city: "Chicago",
            state: "IL",
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2019-04-22"),
        lastLogin: new Date("2024-02-04"),
        projects: ["API Gateway", "Database Migration", "Payment Service"]
    },
    {
        _id: "user_007",
        name: "Grace Lee",
        email: "grace.lee@example.com",
        age: 25,
        role: "UX Designer",
        department: "Design",
        salary: 70000,
        skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
        location: {
            city: "Los Angeles", 
            state: "CA",
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2023-09-11"),
        lastLogin: new Date("2024-02-02"),
        projects: ["Mobile App Design", "Design System", "User Testing"]
    },
    {
        _id: "user_008",
        name: "Henry Miller",
        email: "henry.miller@example.com",
        age: 42,
        role: "Engineering Manager",
        department: "Engineering",
        salary: 125000,
        skills: ["Team Leadership", "Architecture", "Code Review", "Mentoring"],
        location: {
            city: "Boston",
            state: "MA", 
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2018-07-30"),
        lastLogin: new Date("2024-02-05"),
        projects: ["Team Management", "Technical Strategy", "Code Quality"]
    },
    {
        _id: "user_009",
        name: "Isabel Rodriguez",
        email: "isabel.rodriguez@example.com",
        age: 33,
        role: "QA Engineer",
        department: "Quality Assurance",
        salary: 78000,
        skills: ["Test Automation", "Selenium", "Jest", "Manual Testing"],
        location: {
            city: "Phoenix",
            state: "AZ",
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2022-02-14"),
        lastLogin: new Date("2024-01-30"),
        projects: ["Test Suite", "Automation Framework", "Bug Tracking"]
    },
    {
        _id: "user_010",
        name: "Jack Thompson",
        email: "jack.thompson@example.com",
        age: 30,
        role: "Security Engineer", 
        department: "Security",
        salary: 98000,
        skills: ["Cybersecurity", "Penetration Testing", "OWASP", "Compliance"],
        location: {
            city: "Miami",
            state: "FL",
            country: "USA"
        },
        isActive: true,
        joinDate: new Date("2021-12-03"),
        lastLogin: new Date("2024-02-01"),
        projects: ["Security Audit", "Compliance Framework", "Vulnerability Assessment"]
    }
];

async function insertSampleData() {
    let client;
    
    try {
        console.log('🔗 Connecting to MongoDB...');
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        
        const db = client.db();
        const users = db.collection('users');
        
        // Check if users already exist
        const existingCount = await users.countDocuments();
        console.log(`📊 Current users in database: ${existingCount}`);
        
        if (existingCount > 0) {
            console.log('⚠️  Database already has users. Do you want to:');
            console.log('1. Clear existing users and insert new ones');
            console.log('2. Add new users to existing ones');
            console.log('3. Cancel operation');
            console.log('');
            console.log('💡 Edit this script to choose your preferred option');
            return;
        }
        
        // Insert sample users
        console.log('📥 Inserting sample users...');
        const result = await users.insertMany(sampleUsers);
        
        console.log(`✅ Successfully inserted ${result.insertedCount} users`);
        console.log('');
        console.log('Sample users added:');
        sampleUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.role}) - ${user.email}`);
        });
        
        console.log('');
        console.log('🎉 Database populated! You can now test your AI agent with queries like:');
        console.log('   - "How many users are in the database?"');
        console.log('   - "Show me all software engineers"');
        console.log('   - "Find users in California"');
        console.log('   - "What\'s the average salary?"');
        
    } catch (error) {
        console.error('❌ Error inserting data:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('📤 Database connection closed');
        }
    }
}

// Run the insertion
insertSampleData();