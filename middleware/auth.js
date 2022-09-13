const fs = require("fs");
const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token) return res.send({ message: "nessun token - effettua il login" });
  try {
    const options = { expiresIn: "1d", algorithm: "RS256" };
    const JWT_KEY_PUBLIC = fs.readFileSync("./ssl/rsa.public");
    req.payload = jwt.verify(token, JWT_KEY_PUBLIC, options);
    req.body = req.body;
    next();
  } catch (error) {
    return res.send({ message: "Token non valido" });
  }
}

module.exports = {
  checkAuth,
};
