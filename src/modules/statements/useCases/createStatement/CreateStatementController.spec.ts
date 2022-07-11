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
describe('Create Statement Controller', () => {
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

  it("should be create a statement from deposit", async () => {
    const { body } = await request(app).post("/api/v1/statements/deposit").send({
      amount: 600,
      description: "Dinheiro de 1 hora de trabalho"
    }).set("Authorization", 'Bearer ' + jwtToken)

    expect(body).toEqual(expect.objectContaining({
      amount: expect.any(Number),
      created_at: expect.any(String),
      description: expect.any(String),
      id: expect.any(String),
      type: expect.any(String),
      updated_at: expect.any(String),
      user_id: expect.any(String),
    }))
  })

  it("should be create a statement from withdraw", async () => {
    const { body } = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 250,
      description: "Dinheiro de 1 hora de trabalho"
    }).set("Authorization", 'Bearer ' + jwtToken)

    expect(body).toEqual(expect.objectContaining({
      amount: body.amount,
      created_at: body.created_at,
      description: body.description,
      id: body.id,
      type: body.type,
      updated_at: body.updated_at,
      user_id: body.user_id,
    }))
  })

  it("should not be create to statement of withdraw because not funds", async () => {
    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 900,
      description: "Dinheiro de 1 hora de trabalho"
    }).set("Authorization", 'Bearer ' + jwtToken)

    expect(response.status).toBe(400)
  })

  it("should not be create to statement of withdraw because not funds", async () => {
    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 900,
      description: "Dinheiro de 1 hora de trabalho"
    }).set("Authorization", 'Bearer ' + jwtToken)

    expect(response.status).toBe(400)
  })

  it("should not be create to statement if not exists user", async () => {
    connection.getRepository(User).delete(userCredentials.id as unknown as string)

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 900,
      description: "Dinheiro de 1 hora de trabalho"
    }).set("Authorization", 'Bearer ' + jwtToken)

    expect(response.status).toBe(404)
  })
})
