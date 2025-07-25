const pool = require("../config");

const getAllUsersDb = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const createUserDb = async ({ username, password, email, fullname }) => {
  const result = await pool.query(
    `INSERT INTO users(username, password, email, fullname) 
     VALUES($1, $2, $3, $4) 
     RETURNING user_id, username, email, fullname, roles, address, city, state, country, created_at`,
    [username, password, email, fullname]
  );
  return result.rows[0] || null;
};

const getUserByIdDb = async (id) => {
  const result = await pool.query(
    `SELECT users.*, cart.id AS cart_id 
     FROM users 
     LEFT JOIN cart ON cart.user_id = users.user_id 
     WHERE users.user_id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const getUserByUsernameDb = async (username) => {
  const result = await pool.query(
    `SELECT users.*, cart.id AS cart_id 
     FROM users 
     LEFT JOIN cart ON cart.user_id = users.user_id 
     WHERE LOWER(users.username) = LOWER($1)`,
    [username]
  );
  return result.rows[0] || null;
};

const getUserByEmailDb = async (email) => {
  const result = await pool.query(
    `SELECT users.*, cart.id AS cart_id 
     FROM users 
     LEFT JOIN cart ON cart.user_id = users.user_id 
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result.rows[0] || null;
};

const updateUserDb = async ({
  username,
  email,
  fullname,
  id,
  address,
  city,
  state,
  country,
}) => {
  const result = await pool.query(
    `UPDATE users 
     SET username = $1, email = $2, fullname = $3, address = $4, city = $5, state = $6, country = $7 
     WHERE user_id = $8 
     RETURNING username, email, fullname, user_id, address, city, country, state`,
    [username, email, fullname, address, city, state, country, id]
  );
  return result.rows[0] || null;
};

const deleteUserDb = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE user_id = $1 RETURNING *",
    [id]
  );
  return result.rows[0] || null;
};

const createUserGoogleDb = async ({ sub, defaultUsername, email, name }) => {
  const result = await pool.query(
    `INSERT INTO users(google_id, username, email, fullname) 
     VALUES($1, $2, $3, $4) 
     ON CONFLICT (email) 
     DO UPDATE SET google_id = $1, fullname = $4 
     RETURNING *`,
    [sub, defaultUsername, email, name]
  );
  return result.rows[0] || null;
};

const changeUserPasswordDb = async (hashedPassword, email) => {
  const result = await pool.query(
    "UPDATE users SET password = $1 WHERE email = $2",
    [hashedPassword, email]
  );
  return result.rowCount > 0;
};

module.exports = {
  getAllUsersDb,
  getUserByIdDb,
  getUserByEmailDb,
  updateUserDb,
  createUserDb,
  createUserGoogleDb,
  deleteUserDb,
  getUserByUsernameDb,
  changeUserPasswordDb,
};
