require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env-login-server"),
});
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userCheck = require("./authentication");
const { response } = require("express");

const userDataDT = (req, res) => {
  return new Promise((resolve, reject) => {
    const db = userCheck.connect();
    const { username, password } = req.body;

    if (!username || !password) {
      return reject(new Error("Username or password missing"));
    }

    const query = "SELECT * FROM user_members WHERE username = ?";
    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Database query error:", err.message);
        return reject(err);
      }

      if (results.length === 0) {
        console.log("username or password invalid");
        return reject(new Error("Invalid credentials"));
      }

      const user = results[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log("username or password invalid");
        return reject(new Error("Invalid credentials"));
      }

      const accountData = user;
      db.end(); // Properly close the database connection
      resolve(accountData);
    });
  });
};

const getUserDataSLogin = (req, res) => {
  // const db = userCheck.connect();

  // const query = "SELECT * FROM user_members WHERE id = ?";
  //   db.query(query, [username], async (err, results) => {
  //     if (err) {
  //       console.error("Database query error:", err.message);
  //       return reject(err);
  //     }

  //     if (results.length === 0) {
  //       console.log("username or password invalid");
  //       return reject(new Error("Invalid credentials"));
  //     }

  //     const user = results[0];

  // db.end(); // Properly close the database connection
  // })
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ message: "no token" })

  let accountDataWithoutPass = {};
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) {
      accountDataWithoutPass = {
        id_user_member: user.id_user_member,
        username: user.username
      };
      console.log("berhasil auth data: ",accountDataWithoutPass)
      return res.status(200).json(accountDataWithoutPass)
    } else {
      console.log("autentikasi gagal: token invalid")
      return res.status(401).json({ message: "autentikasi gagal: token invalid"})
    }
  });
};

module.exports = { userDataDT, getUserDataSLogin };
