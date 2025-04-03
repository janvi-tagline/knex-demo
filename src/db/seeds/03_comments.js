/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("comments").insert([
    {
      id: 1,
      postId: 1,
      userId: 2,
      content: "Great introduction to Node.js! Very helpful for beginners.",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      postId: 1,
      userId: 3,
      content: "Would love to see more examples of async/await usage.",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      postId: 2,
      userId: 3,
      content: "PostgreSQL arrays are indeed powerful. Thanks for explaining!",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      postId: 3,
      userId: 1,
      content:
        "These design principles are spot on. Especially the part about consistency.",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      postId: 4,
      userId: 2,
      content: "The query optimization tips were very useful. Thanks!",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};
