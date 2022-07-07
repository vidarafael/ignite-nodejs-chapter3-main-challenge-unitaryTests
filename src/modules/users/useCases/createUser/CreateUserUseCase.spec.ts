import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
describe("Create User", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be create an user", async () => {
    const user = await createUserUseCase.execute({
      email: "user@example.com",
      name: "user 1",
      password: "1234"
    })

    expect(user).toStrictEqual(expect.objectContaining({
      id: expect.any(String),
      email: user.email,
      name: user.name,
      password: expect.any(String)
    }))
  })

  it("should not be create an user if exists user with same email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "user@example.com",
        name: "user 1",
        password: "1234"
      })

      await createUserUseCase.execute({
        email: "user@example.com",
        name: "user 2",
        password: "4321"
      })
    }).rejects.toBeInstanceOf(CreateUserError)

  })
})
