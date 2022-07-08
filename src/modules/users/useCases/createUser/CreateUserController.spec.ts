import { app } from "../../../../app"
import request from "supertest"
import { Connection, createConnection } from "typeorm";

let connection: Connection;
describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be create an user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      email: "user@example.com",
      name: "user 1",
      password: "1234"
    })

    expect(response.status).toBe(201)
  })

  it("should not be create an user with user exists", async () => {
    await request(app).post("/api/v1/users").send({
      email: "user@example.com",
      name: "user testando fi",
      password: "1234"
    })

    const response = await request(app).post("/api/v1/users").send({
      email: "user@example.com",
      name: "user testando tambem",
      password: "12345"
    })

    expect(response.status).toBe(400)


  })
})
