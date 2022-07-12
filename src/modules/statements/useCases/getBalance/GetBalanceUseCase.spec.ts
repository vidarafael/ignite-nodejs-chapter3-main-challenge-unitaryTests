import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    )
  })

  it("should be get balance from user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Name",
      email: "user@email.com",
      password: "password"
    })

    await createStatementUseCase.execute({
      amount: 550.50,
      description: "depositando",
      user_id: user.id as string,
      type: 'deposit' as OperationType
    })

    await createStatementUseCase.execute({
      amount: 550.50,
      description: "depositando",
      user_id: user.id as string,
      type: 'deposit' as OperationType
    })

    const statementAndBalance = await getBalanceUseCase.execute({ user_id: user.id as string })

    expect(statementAndBalance).toEqual(expect.objectContaining({
      statement: expect.arrayContaining([
        {
          id: expect.any(String),
          user_id: expect.any(String),
          type: expect.any(String),
          amount: expect.any(Number),
          description: expect.any(String)
        }
      ]),
      balance: expect.any(Number)
    }))
  })

  it("should not be get balance from user non-existent", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'id_not_existent' })
    }).rejects.toBeInstanceOf(GetBalanceError)

  })

})
