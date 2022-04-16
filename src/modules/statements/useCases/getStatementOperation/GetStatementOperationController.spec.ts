import request from "supertest";
import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Get statement operation - Test Integration", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@email.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able get operation", async () => {
    const resultToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@email.com",
      password: "123456",
    });

    const { token } = resultToken.body;

    const credit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Credit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const result = await request(app)
      .get(`/api/v1/statements/${credit.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.status).toBe(200);
    expect(result.body.id).toBe(credit.body.id);
  });

  it("should not be able get operation from a id non-existent", async () => {
    const resultToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@email.com",
      password: "123456",
    });

    const { token } = resultToken.body;

    const result = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.status).toBe(404);
  });
});
