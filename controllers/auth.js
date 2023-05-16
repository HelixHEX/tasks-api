const express = require("express");
const router = express.Router();
const prisma = require("../libs/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

router.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }
    let user;
    await bcrypt.hash(password, saltRounds).then(async (hashedPass) => {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPass,
        },
      });
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.SECRET,
      {
        expiresIn: "60 days",
      }
    );

    return res.status(200).json({ token });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Incorrect email/password" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Incorrect email/password" });
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.SECRET,
      {
        expiresIn: "60 days",
      }
    );

    return res.status(200).json({ token });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
