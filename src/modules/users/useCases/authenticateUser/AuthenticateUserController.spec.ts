import { app } from "../../../../app"
import request from "supertest"

import { Connection, createConnection } from "typeorm";

let connection: Connection;
describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    await request(app)
      .post("/api/v1/users")
      .send({
        email: "user@examples.com",
        name: "user 1",
        password: "1234"
      })

  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be authenticate an user", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "user@examples.com",
      password: "1234"
    })

    expect(body).toEqual(expect.objectContaining({
      user: {
        id: expect.any(String),
        email: expect.any(String),
        name: expect.any(String)
      },
      token: expect.any(String)
    }))
  })

})
