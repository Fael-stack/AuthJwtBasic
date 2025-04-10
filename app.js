require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

const User = require("./models/User");

app.get("/", (req, res) => {
  res.status(200).json({ msg: "funcionando" });
});

app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatório" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "A senha não é igual" });
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Utilize outro email, por favor!" });
  }

  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  const user = new User({
    name,
    email,
    password,
  })
});

const dbUser = process.env.DB_USER;
const dbPassword = encodeURIComponent(process.env.DB_PASS);
const uri = `mongodb+srv://${dbUser}:${dbPassword}@authjwttest.pjvbggh.mongodb.net/?retryWrites=true&w=majority&appName=AuthJwtTest`;

mongoose
  .connect(uri)
  .then(() =>
    app.listen(3000, () => console.log(" MongoDB conectado com sucesso!"))
  )
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));
