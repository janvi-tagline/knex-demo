require("dotenv").config();
//this is the knexfile.js file , it is used to configure the database connection for the project,
//It is used to create the migrations and seeds for the project
//You can use this inside the config folder also. but now every time you need to specify the path of the file. while creating the migrations and seeds.
//so we are using this file in the root directory.
//if you didn't specify the path of the file. while creating the migrations and seeds. it will create the migrations and seeds in the root directory.instead of specific location.

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/db/migrations",
    },
    seeds: {
      directory: "./src/db/seeds",
    },
  },
};
