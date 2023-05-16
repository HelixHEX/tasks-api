// test/task.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const { describe, it } = require("mocha");
const app = require("../index");

const should = chai.should();

chai.use(chaiHttp);

const url = "/v1/task";

const agent = chai.request.agent(app);

const prisma = require("../libs/db");
const deleteChildTasks = require("../libs/deleteTask");

describe("Task", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJlbGlhcyIsIm5hbWUiOiJFbGlhcyBXYW1idWd1IiwiaWF0IjoxNjg0MjAwOTQxLCJleHAiOjE2ODkzODQ5NDF9.IjiKZFQnfy5x67n8ctWZFsPNom0zDXREGYNNb74VG3M";
  const otherToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsImVtYWlsIjoiZWxpYXMyIiwibmFtZSI6ImVsaWFzMiIsImlhdCI6MTY4NDIwMjMzNSwiZXhwIjoxNjg5Mzg2MzM1fQ.nodasqAirOoi9vdNWr5-CWJy7vwh-GxechGJvoMgkaM";
  let task;
  let childTask;

  it("should get all tasks", (done) => {
    agent
      .get(`${url}/all`)
      .auth(token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("tasks");
        done();
      });
  });

  it("should create a task", (done) => {
    agent
      .post(`${url}/new`)
      .auth(token, { type: "bearer" })
      .send({ title: "test task", content: "test content" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("task");
        if (res.body.task) {
          task = res.body.task;
        }
        done();
      });
  });

  it("should get a task by id", (done) => {
    agent
      .get(`${url}/${task.id}`)
      .auth(token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("task");
        done();
      });
  });

  it("should not get a task by id if the user is not the author", (done) => {
    agent
      .get(`${url}/${task.id}`)
      .auth(otherToken, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });

  it("should not get a task by id if the user is not authenticated", (done) => {
    agent.get(`${url}/${task.id}`).end((err, res) => {
      res.should.have.status(401);
      done();
    });
  });

  it("should not get a task by id if the task does not exist", (done) => {
    agent
      .get(`${url}/999999999`)
      .auth(token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it("should update a task", (done) => {
    agent
      .put(`${url}/${task.id}`)
      .auth(token, { type: "bearer" })
      .send({ title: "updated task", content: "updated content" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("task");
        done();
      });
  });

  it("should not update a task if the user is not the author", (done) => {
    agent
      .put(`${url}/${task.id}`)
      .auth(otherToken, { type: "bearer" })
      .send({ title: "updated task", content: "updated content" })
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });

  it("should create a task within another task", (done) => {
    agent
      .post(`${url}/${task.id}/new`)
      .auth(token, { type: "bearer" })
      .send({ title: "test task", content: "test content" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("task");
        childTask = res.body.task;
        done();
      });
  });

  it("should not create a task within another task if the user is not the author", (done) => {
    agent
      .post(`${url}/${task.id}/new`)
      .auth(otherToken, { type: "bearer" })
      .send({ title: "test task", content: "test content" })
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });

  it("should not create a task within another task if the user is not authenticated", (done) => {
    agent
      .post(`${url}/${task.id}/new`)
      .send({ title: "test task", content: "test content" })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it("should not delete a task if the user is not the author", (done) => {
    agent
      .delete(`${url}/${task.id}`)
      .auth(otherToken, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });

  it("should not delete a task if the user is not authenitcated", (done) => {
    agent.delete(`${url}/${task.id}`).end((err, res) => {
      res.should.have.status(401);
      done();
    });
  });

  it("should delete a task", (done) => {
    agent
      .delete(`${url}/${task.id}`)
      .auth(token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(200);
        if (res.should.have.status(200)) {
          task = null;
        }
        done();
      });
  });

  after(async () => {
    if (task) {
      deleteTask(task)
    }
  });
});
