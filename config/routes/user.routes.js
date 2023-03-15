const _ = require("lodash");
const routeUtils = require("./utils.route.js");
const User = require("../../models/user.js");

module.exports = [
  {
    method: "GET",
    path: "/users/self",
    config: {
      description: "Read a user",
      tags: ["Users"],
    },
    handler: async (request, h) => {
      try {
        const { user } = request.auth.credentials;
        const res = await user.findComplete();
        return routeUtils.replyWith.found(res, h);
      } catch (err) {
        return routeUtils.handleErr(err, h);
      }
    },
  },
  {
    method: "GET",
    path: "/users/{userId}",
    config: {
      description: "Read a user",
      tags: ["Users"],
    },
    handler: async (request, h) => {
      try {
        const { userId } = request.params;
        const { user } = request.auth.credentials;
        const res = await user.findCompleteById(userId);
        return routeUtils.replyWith.found(res, h);
      } catch (err) {
        return routeUtils.handleErr(err, h);
      }
    },
  },
];
