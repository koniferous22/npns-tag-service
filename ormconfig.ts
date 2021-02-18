import path from 'path';

export default {
  name: 'tag',
  type: process.env.TAG_DB_TYPE,
  host: process.env.TAG_DB_HOST,
  port: parseInt(process.env.TAG_DB_PORT ?? '', 10),
  username: process.env.TAG_DB_USERNAME,
  password: process.env.TAG_DB_PASSWORD,
  database: process.env.TAG_DB_DATABASE,
  migrations: [path.join(__dirname, 'src/migrations/**/*.ts')],
  entities: [path.join(__dirname, 'src/entities/**/*.ts')],
  cli: {
    migrationsDir: 'src/migrations',
    entitiesDir: 'src/entities'
  }
}
