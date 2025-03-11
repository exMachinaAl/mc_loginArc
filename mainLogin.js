// Import dependencies
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
// const bodyParser = require("body-parser");
const { io } = require("socket.io-client");

const idLoginSvr = "mcLgn3";
const socket = io("http://localhost:3002");
socket.emit("loginServerAcc", "active");
socket.emit("register", idLoginSvr);
//socket.close("loginServerAcc");

//el_L,R,E
const authCR = require("./accountController/authentication");
const {
  userDataDT,
  getUserDataSLogin,
} = require("./accountController/userData");

let flags = "======================================\n";
flags    += "== C2025 Minecraft_Arcedia Login_CT ==\n";
flags    += "======================================";
console.log(flags);

// Setup express app
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
// app.use(bodyParser.send());
// app.use(bodyParser.urlencoded({ extended: true }));

// database checker
const databaseCheck = async () => {
  try {
    await authCR.isConnected()
    console.log("database Connected")
  } catch (error) {
    console.log("database tidak terhubung, silahkan check dan lakukan restart");
    process.exit(1)
  }
  // if (!databaseStatus) {
  //   console.log("database tidak terhubung, silahkan check dan lakukan restart");
  //   process.exit(1)
  // } else console.log("database Connected")
  // console.log(databaseStatus)
}

// user after auth endpoint
// let userDataMultiLine = {};
// app.get("/api/userAuthData", (req, res) => {
//   if (userDataMultiLine) {
//     console.log("dari api userAuthData", userDataMultiLine);
//     res.status(200).send(userDataMultiLine);
//   } else {
//     res.status(401).send("illegeal user detected");
//   }
// });

app.get("/api/v2/userAuthData", getUserDataSLogin);

app.get("/api/dashboard", authCR.authenticateToken, (req, res) => {
  res.json({ message: `Selamat datang, ${req.user.username}!` });
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  // try {
  //   const userGetDataIfTrue = await userDataDT(req, res); // satukan metode ini menjadi satu dengan main veriv, mungkin dengan res.json
  //   userDataMultiLine = userGetDataIfTrue;
  //   console.log("dari api login", userDataMultiLine);
  //   // socket.emit("userDataDetailed", userGetDataIfTrue)
  //   //console.log("debug from main login: ", userGetDataIfTrue);
  // } catch (error) {
  //   console.error("Error in main login:", error.message);
  // }

  // setTimeout(() => { // tolong perbaiki agar lebih dynamic
  // console.log("main Auth run");
  await authCR.login(req, res);
  // }, 3000)
});

// Register endpoint (optional for initial testing)
app.post("/api/register", authCR.register);

app.get("/api/clientConnected", (req, res) => {
  res.send("core: Connected");
});

// Start the server
server.listen(PORT, () => {
  databaseCheck()
  console.log(`Login Server running on http://localhost:${PORT}`);
});
