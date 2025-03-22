require('dotenv').config({ path: require('path').resolve(__dirname, '../.env-login-server')})
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


function connect() {
  let isConnected = false;

    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "mc_ai_gamelogic",
      });

  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err.message);
      return false;
    }
    // console.log("Connected to MySQL database.");
  });

  // console.log(db.authorized)
  // if (!db.authorized)
  //   return false;
// console.log(db)
return db;
}

function isConnected() {
    return new Promise((resolve, reject) => {
      const db = connect(); // Pastikan connect() mengembalikan instance database yang benar
      db.connect((err) => {
        if (err) {
          return reject(false); // Jika gagal, reject promise dengan false
        }
        console.log("Connected to MySQL database.");
        resolve(true); // Jika berhasil, resolve promise dengan true
      });
    });
  }

function login (req, res) {
  const db = connect();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required." });
  }

  const query = "SELECT * FROM user_members WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "username yang anda gunakan tidak ditemukan" });
    }

    const user = results[0];
    // console.log("de usa: ", user);

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    // const passwordMatch = user.password;
    if (!passwordMatch) {
      return res.status(401).json({ message: "password salah" });
    }

    // Generate JWT
    // const token = jwt.sign(
    //   { id: user.id, username: user.username },
    //   JWT_SECRET,
    //   {
    //     expiresIn: "1h",
    //   }
    // );
    const tokenGn = generateToken(user)

    db.close();
    return res.status(200).json({
      message: "login succesfull",
      token: tokenGn,
      userData: user
    })
    // return res.status(200).send("Login successful.");
  });
};

async function register (req, res) {
  let db;
  db = connect();

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .send("username and password a reequired.");
  }

  const querys = "SELECT * FROM user_members WHERE username = ?";
  const [results] = await db.promise().query(querys, [username]);

  if (results.length !== 0) {
    const userAvailable = "username sudah digunakan";
    return res.status(401).send(userAvailable);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  db = connect();
  const query = "INSERT INTO user_members (username, password) VALUES (?, ?)";
  db.query(query, [username, hashedPassword], (err) => {
    if (err) {
      console.error("Database insert error:", err.message);
      return res.status(500).send("Internal server error.");
    }

    db.close()
    return res.status(200).send("User registered successfully.");
  });
};



function generateToken(user) {
  return jwt.sign({ uid: user.id_user_member, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

// Middleware untuk mengecek apakah user sudah login
// function checkLogin(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (token) {
//       jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//           if (!err) {
//               return res.status(400).json({ message: 'Anda sudah login!', redirect: '/dashboard' });
//           }
//       });
//   }

//   next();
// }

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Akses ditolak! Token tidak ditemukan.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token tidak valid!' });

      req.user = user;
      next();
  });
}

module.exports = { login, register, connect, isConnected, /*checkLogin,*/ authenticateToken };
