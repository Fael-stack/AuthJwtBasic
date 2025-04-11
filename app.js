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

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id, "-password");

  if (!User) return res.status(404).json({ msg: "Usuario não encontrado" });

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado" });
  }
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400), json({ msg: "invalid token" });
  }
}

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

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: passwordHash,
  });
  try {
    await user.save();

    res.status(201).json({ msg: "Usuario criado com sucesso" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Erro no Servidor" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatório" });
  }
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(422).json({ msg: "Usuario não encontrado!" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha invalida!" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "Auth realizada com sucesso", token });
  } catch (err) {
    console.log(error);
    res.status(500).json({
      msg: "Erro no servidor, tente novamente mais tarde",
    });
  }
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
