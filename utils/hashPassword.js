const bcrypt = require("bcryptjs");

const salt = bcrypt.genSaltSync(10);

const hashPassword = password =>bcrypt.hashPassword(password, salt);

module.exports = {hashPassword};
