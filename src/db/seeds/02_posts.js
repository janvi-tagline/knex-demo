/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("posts").insert([
    {
      id: 1,
      title: "Getting Started with Node.js",
      content:
        "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine...",
      userId: 1,
      tags: knex.raw("?::text[]", [["javascript", "nodejs", "backend"]]),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      title: "Understanding PostgreSQL Arrays",
      content:
        "PostgreSQL arrays are a powerful feature that allows you to store multiple values...",
      userId: 1,
      tags: knex.raw("?::text[]", [["postgresql", "database", "arrays"]]),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      title: "UI Design Principles",
      content:
        "Good UI design is crucial for creating engaging user experiences...",
      userId: 2,
      tags: knex.raw("?::text[]", [["design", "ui", "ux"]]),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      title: "Advanced SQL Queries",
      content: "Learn how to write efficient and complex SQL queries...",
      userId: 3,
      tags: knex.raw("?::text[]", [["sql", "database", "performance"]]),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};
