const router = require("express").Router();
const { register, login } = require("../controllers/auth.controller");

/**
 * @route   POST /auth/signup
 * @desc    Register a new user
 */
router.post("/signup", register);

/**
 * @route   POST /auth/login
 * @desc    Login user and return JWT
 */
router.post("/login", login);

module.exports = router;
