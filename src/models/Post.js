const { Model } = require("objection");

/**
 * Post Model Methods Available:
 *
 * Basic CRUD Operations:
 * - Post.query().findById(id) - Find a post by ID
 * - Post.query().insert(data) - Create a new post
 * - Post.query().patchAndFetchById(id, data) - Update a post
 * - Post.query().deleteById(id) - Delete a post
 *
 * Query Methods:
 * - Post.query().where(column, operator, value) - Filter posts
 * - Post.query().orderBy(column, direction) - Sort posts
 * - Post.query().limit(number) - Limit number of results
 * - Post.query().offset(number) - Skip results
 * - Post.query().first() - Get first result
 * - Post.query().count() - Count results
 *
 * Relation Methods:
 * - Post.query().withGraphFetched('author') - Include author data
 * - Post.query().withGraphFetched('comments') - Include comments
 * - Post.query().withGraphFetched('[author, comments]') - Include multiple relations
 *
 * Advanced Queries:
 * - Post.query().modifyGraph('author', builder => {...}) - Modify relation query
 * - Post.query().select(...) - Select specific columns
 * - Post.query().distinct() - Get unique results
 * - Post.query().groupBy(column) - Group results
 * - Post.query().having(column, operator, value) - Filter grouped results
 *
 * Transaction Methods:
 * - Post.transaction(callback) - Run queries in transaction
 * - Post.query(trx).insert(data) - Insert within transaction
 *
 * Custom Methods:
 * - post.$query() - Create query builder for this instance
 * - post.$relatedQuery('comments') - Query related records
 * - post.$load(relations) - Load relations for this instance
 * - post.$fetch(relations) - Fetch relations for this instance
 *
 * Validation:
 * - post.$validate() - Validate model data
 * - post.$beforeInsert() - Hook before insert
 * - post.$afterInsert() - Hook after insert
 * - post.$beforeUpdate() - Hook before update
 * - post.$afterUpdate() - Hook after update
 * - post.$beforeDelete() - Hook before delete
 * - post.$afterDelete() - Hook after delete
 *
 * Array Operations:
 * - Post.query().whereRaw('? = ANY(tags)', [tag]) - Find posts with specific tag
 * - Post.query().whereRaw('tags && ?', [['tag1', 'tag2']]) - Find posts with any matching tags
 * - Post.query().whereRaw('tags @> ?', [['tag1', 'tag2']]) - Find posts with all matching tags
 */

class Post extends Model {
  static get tableName() {
    return "posts";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["title", "content", "userId"],
      properties: {
        id: { type: "integer" },
        title: { type: "string", minLength: 1, maxLength: 255 },
        content: { type: "string", minLength: 1 },
        userId: { type: "integer" },
        tags: {
          type: "array",
          items: { type: "string" },
          default: [],
        },
      },
    };
  }

  static get relationMappings() {
    const User = require("./User");
    const Comment = require("./Comment");
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "posts.userId",
          to: "users.id",
        },
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: "posts.id",
          to: "comments.postId",
        },
      },
    };
  }
}

module.exports = Post;
