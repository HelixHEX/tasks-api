require("reflect-metadata");
require("dotenv-safe/config");

const express = require("express");
const { engine } = require("express-handlebars");
const morgan = require("morgan");

const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 5000;

const app = express();

// controllers
const authController = require("./controllers/auth");
const tasksController = require("./controllers/tasks");

app.use(
  morgan(
    ":date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms"
  )
);

app.use(express.json());

app.use(express.static("public"));

app.engine("handlebars", engine({defaultLayout: "main", layoutsDir: ``}));
app.set("view engine", "handlebars");


app.use("/v1", authController);

app.use('/v1/task', tasksController)


app.use('/', (req, res)=> {
  return res.render('home')
})
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

module.exports = app;
