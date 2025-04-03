/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("posts", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.text("content").notNullable();
    table.integer("userId").unsigned().notNullable();
    table.specificType("tags", "text[]").defaultTo(knex.raw("'{}'::text[]"));
    table.timestamps(true, true); 

    table
      .foreign("userId")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.index("userId");
    // table.index("tags", null, "GIN");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("posts");
};
