/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Delete existing entries
  await knex("comments").del();
  await knex("posts").del();
  await knex("users").del();

  await knex("users").insert([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      age: 28,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      age: 32,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      age: 25,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};
