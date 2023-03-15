"use strict";

const _ = require("lodash");
const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize/setup.js");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");

const User = sequelize.define("User", {
  uuid: {
    type: Sequelize.UUID,
    unique: true,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail(email, next) {
        try {
          if (email.length < 6 || email.length > 254)
            return next(new Error("Email must be between 6-254 characters"));

          const result = Joi.string().email().validate(email);

          if (_.has(result, "error")) {
            if (result.error.message === '"value" must be a valid email')
              throw new Error("Email format is invalid");

            throw result.error;
          }

          next();
        } catch (error) {
          throw error;
        }
      },
    },
  },
  createdAt: {
    type: Sequelize.DATE,
    field: "created_at",
  },
  updatedAt: {
    type: Sequelize.DATE,
    field: "updated_at",
  },
});

/**
 * Omit sensitive values whenever toJSON is called
 */
User.prototype.toJSON = function () {
  return _.omit(this.get(), User.restrictedAttrs);
};

/**
 * Find a user along with its roles
 *
 * @returns {Object}
 */
User.prototype.findComplete = async function () {
  const user = this;
  const userObj = user.get();
  const rolesResult = await sequelize.query(
    `SELECT r.name FROM "Roles" r JOIN "UserRoles" ur ON r.id = ur.role_id WHERE ur.user_id = :userId`,
    { replacements: { userId: user.id } }
  );

  return {
    ...userObj,
    roles: _.map(rolesResult[0], "name"),
  };
};

/**
 * Verifies if user has admin role
 *
 * @return {Object}
 */
User.prototype.isAdmin = async function (userId) {
  const adminRole = await sequelize.models.UserRole.findOne({
    where: { userId, roleId: 1 },
  });

  return adminRole ? true : false;
};

/**
 * Find a user by ID along with its roles
 *
 * @returns {Object}
 */
User.prototype.findCompleteById = async function (userId) {
  const user = this;
  const adminRole = await this.isAdmin(user.id);
  if (!adminRole) throw new Error("Unauthorized");

  const result = await sequelize.query(
    `SELECT "Users".*, string_agg("Roles".name, ', ') as role_names
    FROM "Users"
    INNER JOIN "UserRoles" ON "Users".id = "UserRoles".user_id
    INNER JOIN "Roles" ON "UserRoles".role_id = "Roles".id
    WHERE "Users".id = :userId
    GROUP BY "Users".id`,
    { replacements: { userId } }
  );

  const {
    id,
    uuid,
    email,
    created_at: createdAt,
    updated_at: updatedAt,
    role_names
  } = result[0][0];

  return {
    id,
    uuid,
    email,
    createdAt,
    updatedAt,
    roles: role_names.split(',')
  }
};

/**
 * Create and return a JWT access token for a user
 */
User.prototype.generateAccessToken = async function () {
  const user = this;

  // Construct access token
  const accessPayload = {
    userId: user.id,
    userUuid: user.uuid,
    iss: "userfront",
  };

  // Sign token
  const accessToken = jwt.sign(
    accessPayload,
    {
      key: process.env.RSA_PRIVATE_KEY,
    },
    {
      expiresIn: 2592000, // 30 days
      algorithm: "RS256",
    }
  );

  return accessToken;
};

User.restrictedAttrs = ["id", "tokens", "updatedAt"];

module.exports = User;
