const { ObjectID } = require("bson");
const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middleware/auth");

// GET
router.get("/", checkAuth, async (req, res) => {
  const userUid = req.payload.user.uid;
  try {
    await global.anagrafica
      .find({ userUid })
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

router.get("/:id", checkAuth, async (req, res) => {
  const { id } = +req.params;

  try {
    await global.anagrafica.findOne({ _id: ObjectID(id) }).then((response) => {
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

// POST
router.post("/", checkAuth, async (req, res) => {
  const userUid = req.payload.user.uid;
  const { date, day, month, year, mode, note } = req.body;

  const check_user = await global.anagrafica.findOne({ userUid: userUid });

  if (check_user) {
    const check_user_data = await global.anagrafica.findOne({
      userUid: userUid,
      data: { $elemMatch: { date: date } },
    });

    // SE L'OPERAZIONE VIENE ESEGUITA DA UN ADMIN ESEGUI L'OPERAZIONE (SE IL ROLE è ADMIN)

    if (new Date(date) < new Date()) {
      return res.json({
        message:
          "Puoi modificare solo i giorni della settimana corrente e future  ",
        type: "error",
      });
    }

    if (check_user_data) {
      const temp_data = [...check_user_data.data];
      const temp_date = temp_data.find((item) => item.date === date);
      temp_date.mode = mode;
      temp_date.note = note;

      return await global.anagrafica
        .updateOne({ userUid: userUid }, { $set: { data: temp_data } })
        .then((response) => {
          res.json({
            message: "Richiesta elaborata correttamente",
            type: "success",
            response,
          });
        })
        .catch((error) => {
          res.send(error);
        });
    } else {
      return await global.anagrafica
        .updateOne(
          { userUid: userUid },
          { $push: { data: { date, day, month, year, mode, note } } }
        )
        .then((response) => {
          res.json({
            message: "Richiesta elaborata correttamente",
            type: "success",
            response,
          });
        })
        .catch((error) => {
          res.send(error);
        });
    }
  } else {
    return await global.anagrafica
      .insertOne({ userUid, data: [{ date, day, month, year, mode, note }] })
      .then((response) => {
        res.json({
          message: "Richiesta elaborata correttamente",
          type: "success",
          response,
        });
      })
      .catch((error) => {
        res.send(error);
      });
  }
});

// PUT
// router.put("/:id",checkAuth, async (req, res) => {
//   const { id } = req.params;
//   const { nome: nome, cognome: cognome } = req.body;

//   try {
//     await global.anagrafica
//       .updateOne(
//         { _id: ObjectID(id) },
//         { $set: { nome: nome, cognome: cognome } },
//         { upset: true }
//       )
//       .then((response) => {
//         res.send("Elemento cambiato");
//       });
//   } catch (error) {
//     res.json(error.message);
//   }
// });

// DELETE
router.delete("/", checkAuth, async (req, res) => {
  try {
    await global.anagrafica
      .deleteMany()
      .then((response) => res.send("Elementi elemitati dal db"));
  } catch (error) {
    res.json(error.message);
  }
});

// router.delete("/:id",checkAuth, async (req, res) => {
//   const { id } = req.params;
//   try {
//     await global.anagrafica
//       .deleteOne({ _id: ObjectID(id) })
//       .then((response) => res.send("Elemento elemitato dal db"));
//   } catch (error) {
//     res.json(error.message);
//   }
// });

module.exports = router;
