const knex = require("knex");
const { Model } = require("objection");
const knexConfig = require("../../knexfile");

const knexInstance = knex(knexConfig.development);
Model.knex(knexInstance);

module.exports = knexInstance;
