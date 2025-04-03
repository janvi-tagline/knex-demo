const User = require("../models/User");
const { response } = require("../utils/responseHandler");

exports.createUser = async (req, res) => {
  try {
    const user = await User.query().insert(req.body);
    /* if you send array of users then it will also works...
    const user = await User.query().insert(req.body.users); */

    return response(true, res, 201, "User created successfully", user);
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.getUserWithFilteredPosts = async (req, res) => {
  try {
    const searchTerm = req.query.search || "%";

    /* 
     -> withGraphFetched("posts", (builder) => {...})
      Filters related records before fetching them
      Only includes matching records in the result
     ->  modifyGraph("posts", (builder) => {...})
      Transforms the related records after fetching
      Does not filter records, just modifies them
    */

    //USING modifyGraph AND withGraphFetched
    /*   const user = await User.query()
      .findById(req.params.id)
      .withGraphFetched("posts")
      .modifyGraph("posts", (builder) => {
        builder.select("id", "title", "created_at");
        if (searchTerm) {
          builder.where("title", "like", `%${searchTerm}%`);
        }
      }); */

    //USING withGraphFetched
    /*     const user = await User.query()
      .findById(req.params.id)
      .withGraphFetched("posts", (builder) => {
        builder.select("id", "title", "created_at");
        if (searchTerm) {
          builder.where("title", "like", `%${searchTerm}%`);
        }
      }); */

    const user = await User.query()
      .findById(req.params.id)
      .leftJoinRelated("posts")
      .count("posts.id as postCount")
      .select("users.*")
      .groupBy("users.id")
      .modifyGraph("posts", (builder) => {
        builder.select("id", "title", "created_at");
        if (searchTerm) {
          builder.where("title", "like", `%${searchTerm}%`);
        }
      })
      .withGraphFetched("posts");

    //expects a single relation name, not a chain of relations.user.$relatedQuery("posts.comments");
    // const posts = await user.$relatedQuery("posts");
    // const postCount = await user.$relatedQuery("posts").resultSize();
    // const comment = await User.query()
    // .findById(req.params.id)
    // .withGraphFetched("posts.comments");
    if (!user) {
      return response(false, res, 404, "User not found");
    }
    return response(
      true,
      res,
      200,
      "Filtered posts fetched successfully",
      user
    );
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.getUserWithPostCount = async (req, res) => {
  try {
    /* const user = await User.query()
      .findById(req.params.id)
      // If the below line is omitted, only the post count will be included, not the actual posts.
      //withGraphFetched() does not support aggregation directly.
      .withGraphFetched("posts")
      .modify((builder) => {
        builder.select(
          "users.*",
          User.relatedQuery("posts").count().as("postCount")
        );
      }); */

    /* const user = await User.query()
      .findById(req.params.id)
      .withGraphFetched("posts")
      .select("users.*")
      .count("posts.id as postCount")
      .leftJoinRelated("posts")
      .groupBy("users.id"); */

    const user = await User.query()
      .findById(req.params.id)
      .withGraphFetched("posts")
      .select("users.*")
      .select(User.relatedQuery("posts").count().as("postCount"));

    const justAnotherQuery = await User.query()
      .select("users.*")
      .count("posts.id as post_count")
      .leftJoinRelated("posts")
      .where("users.id", "!=", req.params.id)
      .groupBy("users.id")
      .havingRaw("COUNT(posts.id) >= ?", 0)
      .havingRaw("COUNT(posts.id) <= ?", 10)
      .limit(5);

    const multipleGroup = await User.query()
      .select("users.id", "users.name")
      .count("posts.id as post_count")
      .leftJoinRelated("posts")
      .groupBy("users.id", "users.name")
      .havingRaw("count(posts.id) > ?", [0]);

    if (!user) {
      return response(false, res, 404, "User not found");
    }

    return response(
      true,
      res,
      200,
      "Filtered posts and post count fetched successfully",
      {
        user,
        postCount: user.posts?.length || 0,
        justAnotherQuery,
      }
    );
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};
//here
exports.relatePostsToUser = async (req, res) => {
  try {
    const user = await User.query().findById(req.params.id);
    if (!user) {
      return response(false, res, 404, "User not found");
    }

    await user.$relatedQuery("posts").relate(req.body.postIds);

    const updatedUser = await User.query()
      .findById(req.params.id)
      .withGraphFetched("posts");

    return response(
      true,
      res,
      200,
      "Posts related to user successfully",
      updatedUser
    );
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.getPaginatedUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const users = await User.query()
      .withGraphFetched("posts")
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const total = await User.query().resultSize();
    //  const count = await User.query().where("age", ">", 18).resultSize();

    const stats = await User.query()
      .select(
        User.raw("count(*) as total_users"),
        User.raw("avg(age) as average_age"),
        User.raw("max(age) as max_age")
      )
      .first();
    return response(true, res, 200, "Paginated users fetched successfully", {
      users,
      stats,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.getUsersWithRecentPosts = async (req, res) => {
  try {
    const query = User.query()
      .select("users.*")
      .whereExists(function () {
        this.select("*")
          .from("posts")
          // .whereRaw("posts.userId = users.id") //Not working because of single quotes..
          .whereRaw('"posts"."userId" = "users"."id"')
          // .whereRaw('"posts"."userId" = "users"."id"')
          .where(
            "posts.created_at",
            ">",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          );
      })
      .withGraphFetched("posts");

    console.log(query.toKnexQuery().toSQL());
    const users = await query;
    return response(
      true,
      res,
      200,
      "Users with recent posts fetched successfully",
      users
    );
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.getUserPostsWithComments = async (req, res) => {
  try {
    /*
    didn't works  
      const user = await User.query()
        .findById(req.params.id)
        .withGraphJoined("posts.comments") 
        .select("users.*", "posts.*")
        // .count("comments.id as comment_count")
        // .groupBy("users.id", "posts.id"); */

    /*     const user = await User.query()
    .findById(req.params.id)
    .select("users.*", "posts.*")
    .leftJoin("posts", "posts.userId", "users.id") 
    .leftJoin("comments", "posts.id", "comments.postId") 
    .count("comments.id as comment_count")
    .groupBy("users.id", "posts.id"); */

    // const user = await User.query()
    //   .findById(req.params.id)
    //   .withGraphFetched("posts")
    //   .modifyGraph("posts", (builder) => {
    //     builder
    //       .select("posts.*")
    //       .count("comments.id as comment_count")
    //       .leftJoin("comments", "posts.id", "comments.postId")
    //       .groupBy("posts.id");
    //   });

    const user = await User.query()
      .findById(req.params.id)
      .withGraphFetched("posts(postWithCommentCount)")
      .modifiers({
        postWithCommentCount(builder) {
          builder
            .select("posts.*")
            .count("comments.id as comment_count")
            .leftJoin("comments", "posts.id", "comments.postId")
            .groupBy("posts.id");
        },
      });

    if (!user) {
      return response(false, res, 404, "User not found");
    }

    return response(
      true,
      res,
      200,
      "User posts with comments fetched successfully",
      user
    );
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
      minAge,
      maxAge,
    } = req.query;

    const query = User.query().withGraphFetched("posts");

    // Apply search filter
    if (search) {
      query.where((builder) => {
        builder
          .where("name", "ilike", `%${search}%`)
          .orWhere("email", "ilike", `%${search}%`);
      });
    }

    // Apply age filters
    if (minAge) query.where("age", ">=", minAge);
    if (maxAge) query.where("age", "<=", maxAge);

    // Apply sorting
    query.orderBy(sortBy, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.limit(limit).offset(offset);

    const [users, total] = await Promise.all([
      query,
      User.query().resultSize(),
    ]);

    return response(true, res, 200, "Users fetched successfully", {
      users,
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

exports.getUserEngagementMetrics = async (req, res) => {
  try {
    // const query = await User.query()
    //   /*.select(
    //     "users.id",
    //     "users.name",
    //     User.relatedQuery("posts").count().as("post_count"),
    //     User.relatedQuery("posts").max("created_at").as("last_post_date")
    //   ) */
    //   .modify((builder) => {
    //     builder.select(
    //       "users.id",
    //       "users.name",
    //       User.relatedQuery("posts").count().as("postCount"),
    //       User.relatedQuery("posts").max("created_at").as("last_post_date")
    //     );
    //   })
    //   .where("users.id", req.params.id)
    //   .first();
    const query = await User.query()
      .select(
        "users.id",
        "users.name",
        User.raw("COUNT(posts.id) as post_count"),
        User.raw("MAX(posts.created_at) as last_post_date")
      )
      .leftJoin("posts", "posts.userId", "users.id")
      .where("users.id", req.params.id)
      .groupBy("users.id")
      .first();

    const query2 = await User.query()
      .select(
        User.raw("count(*) as total_users"),
        User.raw("avg(age) as average_age"),
        User.raw(
          "count(distinct extract(year from created_at)) as years_active"
        ),
        User.raw("max(created_at) as latest_signup"),
        User.raw("min(created_at) as oldest_signup")
      )
      .first();
    console.log("query2", query2);

    if (!query) {
      return response(false, res, 404, "User not found");
    }

    return response(
      true,
      res,
      200,
      "User engagement query fetched successfully",
      query
    );
  } catch (error) {
    return response(false, res, 500, error.message);
  }
};
