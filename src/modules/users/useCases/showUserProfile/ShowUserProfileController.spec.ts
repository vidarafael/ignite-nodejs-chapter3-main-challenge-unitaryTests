import request from "supertest"
import { app } from "../../../../app";
import { Connection, createConnection } from "typeorm";
import { User } from "../../entities/User";
import { ShowUserProfileError } from "./ShowUserProfileError";


type IShowUserProfile = {
  id: string,
  name: string,
  email: string,
  created_at: string,
  updated_at: string
}

let connection: Connection;
let jwtToken: any;
let user: IShowUserProfile;
describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    await request(app)
      .post("/api/v1/users")
      .send({
        email: "user@examples.com",
        name: "User Test Profile",
        password: "1234"
      })

    const { body: { token } } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@examples.com",
        password: "1234"
      })

    jwtToken = token
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be show user profile", async () => {
    const { body } = await request(app).get("/api/v1/profile").set('Authorization', 'Bearer ' + jwtToken)

    user = body;
    expect(user).toMatchObject<IShowUserProfile>({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    })

  })

  it("should not be show user profile if user not exists", async () => {
    connection.getRepository(User).delete(user.id)

    const response = await request(app).get("/api/v1/profile").set('Authorization', 'Bearer ' + jwtToken)

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({ message: "User not found" })

  })
})
