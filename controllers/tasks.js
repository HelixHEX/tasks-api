const express = require("express");
const router = express.Router();
const prisma = require("../libs/db");
const checkAuth = require("../middleware/auth");
const deleteTask = require("../libs/deleteTask");

router.get("/all", checkAuth, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        AND: [{ authorId: req.user.id }, { taskId: null }],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: true,
      },
    });
    res.status(200).json({ tasks });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/new", checkAuth, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Please provide title and content" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        content,
        author: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });
    res.status(200).json({ task });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/new", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Please provide title and content" });
    }

    const parentTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!parentTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (parentTask.authorId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        content,
        author: {
          connect: {
            id: req.user.id,
          },
        },
        task: {
          connect: {
            id: parseInt(id),
          },
        },
      },
    });

    return res.status(200).json({ task });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        tasks: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (task.authorId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.status(200).json({ task });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Please provide title and content" });
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.authorId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { title, content },
    });

    res.status(200).json({ task: updatedTask });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.delete("/:id", checkAuth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     // const task = await prisma.task.findUnique({
//     //   where: { id: parseInt(id) },
//     //   include: {
//     //     author: {
//     //       select: {
//     //         id: true,
//     //         name: true,
//     //         email: true,
//     //       },
//     //     },
//     //     tasks: true,
//     //   },
//     // });

//     res.json({message: 'task deleted'}).status(200);
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        tasks: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.authorId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    //delete all tasks and child tasks and if those child tasks have tasks delete them too

    deleteTask(task);

    return res.status(200).json({message: 'task deleted'});
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
