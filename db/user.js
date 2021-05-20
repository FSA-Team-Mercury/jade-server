const Sequelize = require("sequelize");
const db = require("./database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const { Badge } = require("./index");
const Badge = require("./badge");
require("dotenv").config();

const SALT_ROUNDS = 5;
const defaultImages = [
  "rihanna",
  "ozil",
  "salah",
  "bad-bunny",
  "beyonce",
  "robo",
  "sophia-loren",
];
const User = db.define("user", {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      max: {
        args: 32,
        msg: "Maximum 32 characters allowed in username",
      },
      min: {
        args: 4,
        msg: "Minimum 4 characters required in username",
      },
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  profileImage: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:
      defaultImages[Math.floor(Math.random() * (defaultImages.length - 1))],
  },
  notification_token: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});

module.exports = User;

/**
 * instanceMethods
 */
User.prototype.correctPassword = function (candidatePwd) {
  //we need to compare the plain version to an encrypted version of the password
  return bcrypt.compare(candidatePwd, this.password);
};

User.prototype.generateToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT);
};

/**
 * classMethods
 */
User.authenticate = async function ({ username, password }) {
  const user = await this.findOne({ where: { username } });
  if (!user || !(await user.correctPassword(password))) {
    const error = Error("Incorrect username/password");
    error.status = 401;
    throw error;
  }

  return user.generateToken();
};

User.findByToken = async function (token) {
  try {
    const { id } = await jwt.verify(token, process.env.JWT);
    const user = User.findByPk(id);
    if (!user) {
      throw "nooo";
    }
    return user;
  } catch (ex) {
    const error = Error("bad token");
    error.status = 401;
    throw error;
  }
};

/**
 * hooks
 */
const hashPassword = async (user) => {
  //in case the password has been changed, we want to encrypt it with bcrypt
  if (user.password.length < 4) {
    const error = Error("Password must be at least 4 letters");
    error.status = 401;
    throw error;
  }
  if (user.username.length < 4) {
    const error = Error("Username must be at least 4 letters");
    error.status = 401;
    throw error;
  }
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
};

function getEagerLoading(friendType, accepted, Badge) {
  return {
    model: User,
    as: friendType,
    attributes: ["id", "username", "profileImage"],
    through: {
      attributes: [
        "accepted",
        "friendshipDate",
        "userId",
        "friendId",
        "createdAt",
      ],
      where: {
        accepted,
      },
    },
    include: {
      model: Badge,
      attributes: ["type", "badgeImage", "createdAt"],
    },
  };
}

User.findFriends = async (id, accepted) => {
  let userData = await User.findAll({
    where: {
      id,
    },
    attributes: ["id", "username", "profileImage"],
    include: [
      getEagerLoading("friendsByRequest", accepted, Badge),
      getEagerLoading("friendsByInquire", accepted, Badge),
    ],
  });

  let existingUser = [];
  userData = userData[0];
  let users = userData.friendsByInquire;
  users = users.concat(userData.friendsByRequest);
  users = users.filter((user) => {
    let existing = existingUser.includes(user.id);
    existingUser.push(user.id);
    return !existing;
  });
  return users;
};

User.beforeCreate(hashPassword);
User.beforeUpdate(hashPassword);
User.beforeBulkCreate((users) => {
  users.forEach(hashPassword);
});
