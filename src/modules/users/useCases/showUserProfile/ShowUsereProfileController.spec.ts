import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile - Test Integration", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  const user = {
    name: "admin",
    email: "admin@email.com",
    password: "123456",
  };

  it("Should be able a user valid", async () => {
    await request(app).post("/api/v1/users").send(user);

    const token = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const result = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token.body.token}`,
      });

    expect(result.body).toHaveProperty("id");
    expect(result.body.email).toEqual(user.email);
  });

  it("Should be able invalid user token", async () => {
    const result = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer InvalidToken`,
    });

    expect(result.status).toBe(401);
  });
});
