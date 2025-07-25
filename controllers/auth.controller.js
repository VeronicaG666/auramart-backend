const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { ErrorHandler } = require("../helpers/error");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  console.log("➡️ Incoming signup request:", { username, email });

  try {
    if (!username || !email || !password) {
      console.warn(" Missing fields:", { username, email, password: !!password });
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log(" Checking if username or email exists...");
    const existing = await pool.query(
      "SELECT * FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );
    console.log(" Existing user check result:", existing.rows);

    if (existing.rows.length > 0) {
      console.warn(" Duplicate found:", existing.rows[0]);
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    console.log(" Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(" Inserting user into DB...");
    const result = await pool.query(
      `INSERT INTO users (username, email, password, is_admin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, is_admin`,
      [username, email, hashedPassword, false]
    );

    console.log(" Insert result:", result.rows);

    const user = result.rows[0];
    const token = generateToken(user);

    console.log(" Registration successful for user:", user.username);

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(" Registration error details:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new ErrorHandler(400, "Email and password are required");
    }

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!result.rows.length) {
      throw new ErrorHandler(401, "Invalid credentials");
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new ErrorHandler(401, "Invalid credentials");

    delete user.password;
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error details:", error);
    next(error instanceof ErrorHandler ? error : new ErrorHandler(500, "Login failed"));
  }
};

module.exports = {
  register,
  login,
};