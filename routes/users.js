const { v4: uuidv4 } = require("uuid");
require("dotenv").config({
  path: "../config.env",
});
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middleware/auth");

// GET ALL USERS
router.get("/user", checkAuth, async (req, res) => {
  try {
    await global.users
      .find({})
      .toArray()
      .then((response) => {
        res.json({
          message: "Richiesta elaborata correttamente",
          type: "success",
          response,
        });
      });
  } catch (error) {
    res.json(error.message);
  }
});

// POST REGISTER
router.post("/register", checkAuth, async (req, res) => {
  const {
    username,
    surname,
    birth,
    birthplace,
    birthplaceProvincia,
    gender,
    cf,
    cellulare,
    indirizzo,
    password,
  } = req.body;
  let email = req.body.email;

  if (email) email.toLowerCase();

  if (!email || !password)
    return res.status(400).send({ message: "Email o password mancanti" });

  const check_email = await global.users.findOne({ email });
  if (check_email)
    return res
      .status(401)
      .send({ message: `${email} risulta essere già registrata` });

  const hashed_password = await bcrypt.hash(password, 10);
  const uid = await uuidv4();
  await global.users
    .insertOne({
      surname: surname,
      birth: birth,
      birthplace: birthplace,
      birthplaceProvincia: birthplaceProvincia,
      gender: gender,
      cf: cf,
      cellulare: cellulare,
      indirizzo: indirizzo,
      username,
      email,
      password: hashed_password,
      uid: uid,
      role: "standard",
    })
    .then((response) => {
      res.status(201).send({ message: "Utente registrato correttamente" });
    })
    .catch((error) => {
      res.send(error);
    });
});

// POST LOGIN
router.post("/login", async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  if (!email || !password)
    return res.status(400).send({ message: "Email o password mancanti" });

  const user = await global.users.findOne({ email });
  if (!user) return res.status(401).send({ message: `Credenziali Errate` });

  const compare_password = await bcrypt.compare(password, user.password); // true/false
  if (email !== user.email || !compare_password)
    return res.status(401).send({ message: `Credenziali Errate` });

  if (email === user.email && compare_password) {
    // CREAZIONE E GESTIONE TOKEN
    const payload = { user };
    const options = { expiresIn: "365d", algorithm: "RS256" };
    const JWT_KEY_PRIVATE = fs.readFileSync("./ssl/rsa.private");
    const token = jwt.sign(payload, JWT_KEY_PRIVATE, options);
    // CREAZIONE E GESTIONE COOKIE - cookie-parser
    res.send({
      user: user,
      token: token,
      message: "login effettuato correttamente",
    });
  }
});

// DELETE
router.delete("/", checkAuth, async (req, res) => {
  try {
    await global.users
      .remove()
      .then((response) => res.status(200).send("UTENTI ELIMINATI"));
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = router;
