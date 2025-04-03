const Post = require("../models/Post");
const { response } = require("../utils/responseHandler");

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.query()
      .findById(req.params.id)
      .withGraphFetched("author");
    if (!post) {
      return response(false, res, 404, "Post not found");
    }
    return response(true, res, 200, "Post fetched successfully", post);
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.createPost = async (req, res) => {
  try {
    //First way
    /* const post = await Post.query().insert(req.body);
    const postWithAuthor = await Post.query()
      .findById(post.id)
      .withGraphFetched("author"); */

    //Second way using transaction..
    /* 
    // Inserting a new post , Fetching the post with its author.
    // If the insert operation succeeds but withGraphFetched("author") fails (e.g., due to a DB issue), then:The post is already inserted into the database,
    // But the response might fail, leading to incomplete or inconsistent data for the caller.
    // If anything fails inside the transaction, the database rolls back the changes.
    // This prevents incomplete or inconsistent data from being saved.
    // Ensures that both operations (insert & fetch) are treated as a single unit.
    // const post = await Post.query().insert({ title, content, authorId });
    // If this fails, the post is already saved, but the response will fail
       const postWithAuthor = await Post.query()
       .findById(post.id)
       .withGraphFetched("author");
    */

    const postData = { ...req.body };
    if (postData.tags) {
      postData.tags = Post.knex().raw("?::text[]", [postData.tags]);
    }

    const postWithAuthor = await Post.transaction(async (trx) => {
      // const post = await Post.query(trx).insert(req.body);
      const post = await Post.query(trx).insert(postData);
      return await Post.query(trx).findById(post.id).withGraphFetched("author");
    });

    return response(
      true,
      res,
      201,
      "Post created successfully",
      postWithAuthor
    );
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.updatePost = async (req, res) => {
  try {
    /*  
     const post = await Post.query().patchAndFetchById(req.params.id, req.body);
    if (!post) {
      return response(false, res, 404, "Post not found");
    }
      return response(true, res, 200, "Post updated successfully", post);
       */
    //-------------------------------------------------------------------------------
    /*   
    const post = await Post.query().updateAndFetchById(req.params.id, req.body);
    if (!post) {
      return response(false, res, 404, "Post not found");
    }
      return response(true, res, 200, "Post updated successfully", post); */
    //-------------------------------------------------------------------------------
    /*
     const post = await Post.query()
      .findById(req.params.id)
      .patch(req.body);
    const updatedPost = await Post.query().findById(req.params.id);
    return response(true, res, 200, "Post updated successfully", updatedPost);
    */
    //-------------------------------------------------------------------------------
    /*  
    const post = await Post.query()
    .where("id", req.params.id)
    .update(req.body)
    .returning("*");
     if (!post) {
      return response(false, res, 404, "Post not found");
    }
    return response(true, res, 200, "Post updated successfully", post);
    */
    //-------------------------------------------------------------------------------
    /*    const { id } = req.params;
   const updateData = { ...req.body };

   // If tags are provided, ensure they're in array format
   if (updateData.tags) {
     // If tags is a string, split it into an array
     if (typeof updateData.tags === "string") {
       updateData.tags = updateData.tags.split(",").map((tag) => tag.trim());
     }
     // If it's already an array, use it as is
     else if (!Array.isArray(updateData.tags)) {
       updateData.tags = [];
     }
   }
   const updatedPost = await Post.transaction(async (trx) => {
     // First check if post exists
     const existingPost = await Post.query(trx).findById(id);
     if (!existingPost) {
       throw new Error("Post not found");
     }

     // Update the post
     const post = await Post.query(trx).patchAndFetchById(id, updateData);

     // Fetch the updated post with author information
     return await Post.query(trx).findById(id).withGraphFetched("author");
   }); */

    const updatedPost = await Post.query().findById(req.params.id);
    if (updatedPost) {
      await updatedPost.$query().patch(req.body);
    }
    if (!updatedPost) {
      return response(false, res, 404, "Post not found");
    }
    return response(true, res, 200, "Post updated successfully", updatedPost);
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.deletePost = async (req, res) => {
  try {
    // const deleted = await Post.query().deleteById(req.params.id);
    // const deleted = await Post.query().where("id", req.params.id).delete();
    const deleted = await Post.query().where("id", req.params.id).del();

    if (!deleted) {
      return response(false, res, 404, "Post not found");
    }

    /* const post = await Post.query().findById(req.params.id);
    if (!post) {
      return response(false, res, 404, "Post not found");
    }
    await post.$query().delete();
     */
    return response(true, res, 200, "Post deleted successfully");
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
      userId,
      startDate,
      endDate,
    } = req.query;

    const query = Post.query().withGraphFetched("author");

    if (search) {
      query.where((builder) => {
        builder
          .where("title", "ilike", `%${search}%`)
          .orWhere("content", "ilike", `%${search}%`);
      });
    }

    if (userId) {
      query.where("userId", userId);
    }

    if (startDate) {
      query.where("created_at", ">=", startDate);
    }
    if (endDate) {
      query.where("created_at", "<=", endDate);
    }

    query.orderBy(sortBy, sortOrder);

    const offset = (page - 1) * limit;
    query.limit(limit).offset(offset);

    const [posts, total] = await Promise.all([
      query,
      Post.query().resultSize(),
    ]);

    return response(true, res, 200, "Posts fetched successfully", {
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.getRelatedPostsOfUsers = async (req, res) => {
  try {
    const post = await Post.query().findById(req.params.id);
    if (!post) {
      return response(false, res, 404, "Post not found");
    }

    const { tags } = req.body;
    let tagArray = [];
    if (tags) {
      tagArray = tags.split(",");
    }

    const relatedPostsQuery = Post.query()
      .withGraphFetched("author")
      .where("id", "!=", post.id)
      .where("userId", post.userId)
      .orderBy("created_at", "desc")
      .limit(5)
      .modify((query) => {
        if (post.tags && post.tags.length > 0) {
          query.where((builder) => {
            post.tags.forEach((tag) => {
              // builder.orWhere("tags", "contains", [tag]);
              builder.orWhereRaw("? = ANY(tags)", [tag]);
            });
          });
        }
      });

    //  const relatedPostsQuery = await Post.query()
    //    .withGraphFetched("author")
    //    .modifyGraph("author.posts", (builder) => {
    //      builder
    //        .where("id", "!=", post.id)
    //        .orderBy("created_at", "desc")
    //        .limit(5);
    //    });

    // const relatedPostsQuery = await Post.query()
    //   .where("userId", (qb) => {
    //     qb.select("userId").from("posts").where("id", req.params.id);
    //   })
    //   .where("id", "!=", req.params.id)
    //   .withGraphFetched("author")
    //   .orderBy("created_at", "desc")
    //   .limit(5);
    // if (tagArray.length > 0) {
    //   relatedPostsQuery.where((builder) => {
    //     tagArray.forEach((tag) => {
    //       builder.orWhereRaw("tags @> ?", [`["${tag}"]`]); // JSONB containment operator
    //     });
    //   });
    // }

    const relatedPosts = await relatedPostsQuery;

    // Objection.js uses Knex.js to generate SQL queries.
    // However, Knex does not have built-in support for all SQL functions, especially aggregate functions like COUNT(), AVG(), MAX(), etc.
    // To execute custom SQL expressions, we use Knex's raw() function, which allows us to run raw SQL queries inside Knex/Objection.js.
    const stats = await Post.query()
      .select(
        Post.raw("count(*) as total_posts"),
        Post.raw('count(distinct "userId") as unique_authors'),
        Post.raw("avg(length(content)) as avg_content_length"),
        Post.raw("max(created_at) as latest_post"),
        Post.raw("min(created_at) as oldest_post")
      )
      .first();
    return response(
      true,
      res,
      200,
      "Related posts fetched successfully",
      relatedPosts,
      stats
    );
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.findPostsByTags = async (req, res) => {
  try {
    const { id } = req.query;
    const { title, content, tags } = req.body;

    // const posts = await Post.query().whereIn("userId", [1, 2]);

    //      const posts = await Post.query()
    //    .where("title", "like", "%React%")
    //    .orWhere("content", "like", "%JavaScript%")
    //  .withGraphFetched("author");

    /*  const posts = await Post.query()
      .update({ title })
      .where("id", id)
      .returning("*");
//       {
//     "success": false,
//     "message": "content: must have required property 'content', userId: must have required property 'userId'"
// }
      */

    //  const posts = await Post.query()
    //     .patch({ content })
    //     .where("id", 1)
    //     .returning("*");

    // const posts = await Post.query()
    //   .whereNotNull("tags")
    //   .orWhereNotNull("content")
    //   .withGraphFetched("author");

    // const posts = await Post.query()
    //   .whereNull("tags")
    //   .orWhereNull("content")
    //   .withGraphFetched("author");

    //rightJoinRelated,leftJoinRelated

    // const posts = await Post.query()
    //   .whereRaw("LOWER(title) = ?", [title.toLowerCase()])
    //   .orWhereRaw("LOWER(content) LIKE ?", [`%${content.toLowerCase()}%`])
    //   .withGraphFetched("author");

    // const insertWithConflict = await Post.query()
    //   .insert({
    //     title: "New Post",
    //     content: "Content",
    //     userId: 1,

    //     tags: Post.knex().raw("?::text[]", [["javascript", "react"]]),
    //   })
    //   .onConflict(["title"])
    //   .ignore();

    // const posts = await Post.query()
    //   .rightJoin("users", "posts.userId", "users.id")
    //   .rightJoin("comments", "posts.id", "comments.postId")
    //   .select(
    //     "posts.*",
    //     "users.name as author_name",
    //     "comments.content as comment_content"
    //   )
    //   .where("posts.id", id);

    // const posts = await Post.query()
    //   .whereIn("userId", [1, 2])
    //   .whereRaw("tags && ?::text[]", [tags])
    //   .withGraphFetched("author");

    // const posts = await Post.query()
    //   .whereExists(
    //     Post.relatedQuery("comments").where(
    //       "comments.created_at",
    //       ">",
    //       "2012-01-01"
    //     )
    //   )
    //   .withGraphFetched("author");

    const posts = await Post.query()
      .whereBetween("created_at", ["2024-01-01", "2025-12-31"])
      .withGraphFetched("author");
    return response(true, res, 200, "Posts found successfully", {
      posts,
    });
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};
