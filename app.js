require("dotenv").config({
  path: "./config.env",
});
const { PORT, MONGO_URI } = process.env || 3001;
const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(cors());
const httpServer = http.createServer(app);

const connect = require("./db/connect");

// ROUTES PATH
const ANAGRAFICA = require("./routes/anagrafica");
const USERS = require("./routes/users");

// ROUTES
app.use("/api/anagrafica", ANAGRAFICA);
app.use("/api/users", USERS);

// START SERVER
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// CONNECT DB
connect.start(MONGO_URI);
