import "reflect-metadata";
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be authenticate user", async () => {
    await createUserUseCase.execute({
      name: "User test",
      email: "usertest@test.com",
      password: "1234"
    })

    const tokenWithUser = await authenticateUserUseCase.execute({
      email: "usertest@test.com",
      password: '1234'
    })

    expect(tokenWithUser).toHaveProperty("token")
    expect(tokenWithUser).toHaveProperty("user")
  })

  it("should be not authentica user if email not exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User test",
        email: "usertest@test.com",
        password: "1234"
      })

      await authenticateUserUseCase.execute({
        email: "emailNotExists@hotmail.com",
        password: '1234'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should be not authentica user if password not exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User test",
        email: "usertest@test.com",
        password: "1234"
      })

      await authenticateUserUseCase.execute({
        email: "usertest@test.com",
        password: 'senhaNaoExiste'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

})
