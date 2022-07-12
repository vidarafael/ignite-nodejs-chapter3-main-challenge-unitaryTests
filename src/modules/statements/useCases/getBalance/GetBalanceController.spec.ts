import { User } from './../../../users/entities/User';
import { app } from "../../../../app"
import request from "supertest"
import { Connection, createConnection } from "typeorm";

let connection: Connection;
let jwtToken: string;
let userCredentials = {
  id: null,
  name: "User Credentials Name",
  email: "usercredentials@email.com",
  password: "userpassword"
};
describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    await request(app).post('/api/v1/users').send(userCredentials)
    const response = await request(app).post('/api/v1/sessions').send({
      email: userCredentials.email,
      password: userCredentials.password
    })
    const { token, user } = response.body

    jwtToken = token
    userCredentials.id = user.id
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be get balance from user", async () => {
    await request(app).post("/api/v1/statements/deposit").send({
      amount: 600,
      description: "Dinheiro de 1 hora de trabalho"
    }).set("Authorization", 'Bearer ' + jwtToken)

    const { body } = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", 'Bearer ' + jwtToken)

    expect(body).toEqual(expect.objectContaining({
      statement: expect.arrayContaining([
        {
          id: expect.any(String),
          amount: expect.any(Number),
          description: expect.any(String),
          type: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String)
        }
      ]),
      balance: expect.any(Number)
    }))
  })

  it("should not be get balance from user non-existent", async () => {
    connection.getRepository(User).delete(userCredentials.id as unknown as string)

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", 'Bearer ' + jwtToken)

    expect(response.status).toBe(404)
  })

})
