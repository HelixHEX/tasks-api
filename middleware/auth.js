const jwt = require("jsonwebtoken");
const prisma = require("../libs/db");

const authenticate = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decode = jwt.verify(token, process.env.SECRET);
      let user = await prisma.user.findUnique({
        where: {
          id: decode.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        console.log("user not found");
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user;

      next();
    } catch (err) {
      console.log(err.message);
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authenticate;
