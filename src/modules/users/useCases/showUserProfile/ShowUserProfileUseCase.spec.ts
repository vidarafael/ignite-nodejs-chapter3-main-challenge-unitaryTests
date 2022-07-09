import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
describe("Show user profile", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be show user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "user test",
      email: "user@test.com",
      password: "test123"
    })

    const showUser = await showUserProfileUseCase.execute(user.id as string)

    expect(showUser).toHaveProperty("id")
  })

  it("should not be show user profile", async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "user test",
        email: "user@test.com",
        password: "test123"
      })

      await showUserProfileUseCase.execute(user.id + 'notExistsThisId')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
