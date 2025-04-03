
1. Install dependencies:

```bash
npm install
```

2. Create a PostgreSQL database:

```bash
createdb objection_demo
```

3. Configure your database connection in the `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=objection_demo
PORT=3000
```

4. Run migrations:
```bash
npx knex migrate:make add_age_to_users
```

```bash
npx knex migrate:latest
```

```bash
npx knex seed:make add_users_and_posts
```

```bash
npx knex seed:run --knexfile knexfile.js
```
## Running the Application
```bash
npm run dev
```
