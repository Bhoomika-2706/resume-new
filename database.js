const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'resume_builder'
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Function to initialize database (create tables if they don't exist)
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create resumes table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS resumes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                personal_info TEXT,
                work_experience TEXT,
                education TEXT,
                skills TEXT,
                template VARCHAR(50) DEFAULT 'template1',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        // Create templates table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                thumbnail VARCHAR(255),
                html_template TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Insert default templates if they don't exist
        const [templates] = await connection.query('SELECT * FROM templates');
        if (templates.length === 0) {
            await connection.query(`
                INSERT INTO templates (name, thumbnail, html_template) VALUES 
                ('Professional', 'https://via.placeholder.com/150x200?text=Professional', NULL),
                ('Modern', 'https://via.placeholder.com/150x200?text=Modern', NULL),
                ('Creative', 'https://via.placeholder.com/150x200?text=Creative', NULL)
            `);
        }
        
        connection.release();
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Database initialization failed:', err);
        process.exit(1);
    }
}

module.exports = {
    pool,
    initializeDatabase
};