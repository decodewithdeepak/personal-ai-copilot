require('dotenv').config({ path: '../../.env' });
const pool = require('./connection');

const seedData = async () => {
    try {
        console.log('🌱 Seeding database...');

        // Create default user
        await pool.query(`
      INSERT INTO users (email, name) 
      VALUES ('user@example.com', 'Demo User') 
      ON CONFLICT (email) DO NOTHING;
    `);

        // Get user ID
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', ['user@example.com']);
        const userId = userResult.rows[0].id;

        // Seed tasks
        const tasks = [
            {
                title: 'Complete AI Copilot project',
                description: 'Implement all components: n8n, CrewAI, RAG, and frontend',
                priority: 'high',
                due_date: '2025-09-04'
            },
            {
                title: 'Team standup meeting',
                description: 'Daily team sync at 9 AM',
                priority: 'medium',
                due_date: '2025-09-03'
            },
            {
                title: 'Code review for authentication module',
                description: 'Review and provide feedback on new auth implementation',
                priority: 'medium',
                due_date: '2025-09-03'
            }
        ];

        for (const task of tasks) {
            await pool.query(`
        INSERT INTO tasks (user_id, title, description, priority, due_date) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING;
      `, [userId, task.title, task.description, task.priority, task.due_date]);
        }

        // Seed documents for RAG
        const documents = [
            {
                title: 'Project Requirements',
                content: 'Personal AI Copilot project requirements include automation layer with n8n, agent collaboration with CrewAI, RAG system for knowledge retrieval, and full-stack web application.',
                source: 'assignment',
                document_type: 'requirements'
            },
            {
                title: 'AI Development Best Practices',
                content: 'When developing AI applications, focus on prompt engineering, error handling, user experience, and integration between different AI services.',
                source: 'knowledge_base',
                document_type: 'guide'
            },
            {
                title: 'Daily Schedule Template',
                content: 'Morning: Review tasks and priorities. Afternoon: Deep work sessions. Evening: Team sync and planning for next day.',
                source: 'personal',
                document_type: 'template'
            }
        ];

        for (const doc of documents) {
            await pool.query(`
        INSERT INTO documents (user_id, title, content, source, document_type) 
        VALUES ($1, $2, $3, $4, $5);
      `, [userId, doc.title, doc.content, doc.source, doc.document_type]);
        }

        console.log('✅ Database seeded successfully');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
};

seedData();
