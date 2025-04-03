const { Model } = require("objection");

class User extends Model {
  static get tableName() {
    return "users";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["email", "name"],
      properties: {
        id: { type: "integer" },
        email: { type: "string", format: "email" },
        name: { type: "string", minLength: 1, maxLength: 255 },
        age: { type: ["integer", "null"] },
      },
    };
  }

  static get relationMappings() {
    const Post = require("./Post");
    return {
      posts: {
        relation: Model.HasManyRelation,
        modelClass: Post,
        join: {
          from: "users.id",
          to: "posts.userId",
        },
      },
    };
  }
}

module.exports = User;
