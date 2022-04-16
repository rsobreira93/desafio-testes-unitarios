import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User - Test Integration", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@email.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able authenticate", async () => {
    const result = await request(app).post("/api/v1/sessions").send({
      email: "admin@email.com",
      password: "123456",
    });

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("token");
  });

  it("should not be able authenticate with password incorrect", async () => {
    const result = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "incorrect_password",
    });

    expect(result.status).toBe(401);
  });

  it("should not be able authenticate with email incorrect", async () => {
    const result = await request(app).post("/api/v1/sessions").send({
      email: "incorrect@email.com.br",
      password: "123456",
    });

    expect(result.status).toBe(401);
  });
});
