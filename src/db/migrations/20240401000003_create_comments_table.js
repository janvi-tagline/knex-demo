/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("comments", (table) => {
    table.increments("id").primary();
    //unsigned for non-negative values, starting from 1 , not include 0 also...
    table.integer("postId").unsigned().notNullable();
    table.integer("userId").unsigned().notNullable();
    table.text("content").notNullable();
    table.timestamps(true, true);

    table
      .foreign("postId")
      .references("id")
      .inTable("posts")
      .onDelete("CASCADE");

    table
      .foreign("userId")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.index("postId");
    table.index("userId");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("comments");
};
