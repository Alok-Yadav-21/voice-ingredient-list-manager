// Database Configuration
export const databaseConfig = {
  host: 'localhost',
  port: 5432,
  database: 'voice_ingredient_lists',
  user: 'postgres',
  password: 'your_password_here', // Replace with your actual PostgreSQL password
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Environment-based configuration
export const getDatabaseConfig = () => {
  return {
    host: process.env.DB_HOST || databaseConfig.host,
    port: parseInt(process.env.DB_PORT || databaseConfig.port.toString()),
    database: process.env.DB_NAME || databaseConfig.database,
    user: process.env.DB_USER || databaseConfig.user,
    password: process.env.DB_PASSWORD || databaseConfig.password,
    max: parseInt(process.env.DB_MAX || databaseConfig.max.toString()),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || databaseConfig.idleTimeoutMillis.toString()),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || databaseConfig.connectionTimeoutMillis.toString()),
  };
}; 