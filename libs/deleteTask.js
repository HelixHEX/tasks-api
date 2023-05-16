const prisma = require("./db");

const deleteTask = async (task) => {
  const childTasks = await prisma.task.findMany({
    where: { taskId: task.id },
  });
  if (childTasks.length > 0) {
    for (let i = 0; i < childTasks.length; i++) {
      await deleteTask(childTasks[i]);
    }
  }

  await prisma.task.delete({ where: { id: task.id } });
};

module.exports = deleteTask;