// test/auth.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const { describe, it } = require("mocha");
const app = require("../index");

const should = chai.should();

chai.use(chaiHttp);

const agent = chai.request.agent(app);

const prisma = require("../libs/db");

const url = "/v1";
describe("User", () => {
  const wrongUser = {
    email: "wrong@user.com",
    name: "wronguser",
    password: "wronguser",
  };
  const testUser = {
    email: "test@user.com",
    name: "testuser",
    password: "testuser",
  };
  it("should not be able to signin if they don't have an account", (done) => {
    agent
      .post(`${url}/signin`)
      .send(wrongUser)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it("should be able to signup", (done) => {
    agent
      .post(`${url}/signup`)
      .send(testUser)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("token");
        done();
      });
  });

  after(async () => {
    await prisma.user.delete({
      where: {
        email: testUser.email,
      },
    });
  });
});
