import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  })

  it("should be authenticate user", async () => {

    const user = await inMemoryUsersRepository.create({
      name: "User test",
      email: "usertest@test.com",
      password: "1234"
    })

    console.log(user)

    const tokenWithUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    })

    expect(tokenWithUser).toHaveProperty("token")
    expect(tokenWithUser).toHaveProperty("user")
  })
})
