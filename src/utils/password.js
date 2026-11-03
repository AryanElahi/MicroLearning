const bcrypt = require("bcrypt");
const config = require("../config");

// A real hash used when the account doesn't exist, so login takes the same
// time whether or not the username/phone is registered.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", config.bcryptSaltRounds);

const hashPassword = (password) => bcrypt.hash(password, config.bcryptSaltRounds);

const verifyPassword = (password, hash) => bcrypt.compare(password, hash || DUMMY_HASH);

module.exports = { hashPassword, verifyPassword };
