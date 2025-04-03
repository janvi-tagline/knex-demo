const { Model } = require("objection");

class Comment extends Model {
  static get tableName() {
    return "comments";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["postId", "content"],
      properties: {
        id: { type: "integer" },
        postId: { type: "integer" }, 
        userId: { type: "integer" }, 
        content: { type: "string", minLength: 1 }, 
        created_at: { type: "string", format: "date-time" }, 
      },
    };
  }

  static get relationMappings() {
    const Post = require("./Post");
    const User = require("./User");

    return {
      post: {
        relation: Model.BelongsToOneRelation,
        modelClass: Post,
        join: {
          from: "comments.postId",
          to: "posts.id",
        },
      },
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "comments.userId",
          to: "users.id",
        },
      },
    };
  }
}

module.exports = Comment;
