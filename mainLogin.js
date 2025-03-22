// Import dependencies
require("dotenv").config({ path: './.env.login-server' });
const createLogger = require('./controlProperties/logger')
const express = require("express");
const cors = require("cors");
const http = require("http");
// const bodyParser = require("body-parser");
const { io } = require("socket.io-client");

const author = process.env.APP_AUTHOR;
const idLoginSvr = "mcLgn3";

const logLogin = createLogger()

logLogin.setFolderFilePath(process.env.LOGIN_LOG_APP).setSilentMode(true).setCustomFile("loginInfo").startLog();

if (!process.env.VITE_MAIN_APP_PORT || !process.env.VITE_MAIN_SOCKET_IP) {
  console.error("gagal mendapatkan host main server app")
  process.exit(1)
}
const socket = io(`http://${process.env.VITE_MAIN_SOCKET_IP}:${process.env.VITE_MAIN_APP_PORT}`);
socket.emit("loginServerAcc", "active");
socket.emit("register", idLoginSvr);
//socket.close("loginServerAcc");

//el_L,R,E
const authCR = require("./accountController/authentication");
const {
  userDataDT,
  getUserDataSLogin,
} = require("./accountController/userData");
const { send } = require("process");

let flags = "======================================\n";
flags    += "== C2025 Minecraft_Arcedia Login_CT ==\n";
flags    += `==        Made by ${author}        ===\n`
flags    += "======================================";
console.log(flags);

// Setup express app
const app = express();
const HOST = process.env.VITE_LOGIN_SOCKET_IP;
const PORT = process.env.VITE_LOGIN_PORT;

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
  await authCR.login(req, res); // nanti console.log
  // }, 3000)
});

// Register endpoint (optional for initial testing)
app.post("/api/register", authCR.register);

app.get("/api/clientConnected", (req, res) => {
  // res.json({ message: "core: Connected", status: 200 });
  res.send("client: connected")
});

// Start the server
server.listen(PORT, HOST, () => {
  databaseCheck()
  console.log(`Login Server running on http://${HOST}:${PORT}`);
  logLogin.getLineCode().info(`Login Server running on http://${HOST}:${PORT}`)
});
