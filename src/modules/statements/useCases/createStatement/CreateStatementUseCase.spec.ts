import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statements", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  })

  it("should be create a statement from deposit", async () => {
    const user = await createUserUseCase.execute({
      name: "User Name",
      email: "user@email.com",
      password: "password"
    })

    const statementDeposit = await createStatementUseCase.execute({
      amount: 500,
      description: "depositando",
      user_id: user.id as string,
      type: 'deposit' as OperationType
    })

    expect(statementDeposit).toHaveProperty("id")
    expect(statementDeposit).toHaveProperty("type", "deposit")
    expect(statementDeposit).toHaveProperty("user_id", user.id)
  })

  it("should be create a statement from withdraw", async () => {
    const user = await createUserUseCase.execute({
      name: "User Name",
      email: "user@email.com",
      password: "password"
    })

    await createStatementUseCase.execute({
      amount: 500,
      description: "deposito",
      user_id: user.id as string,
      type: 'deposit' as OperationType
    })

    const statementWithdraw = await createStatementUseCase.execute({
      amount: 500,
      description: "Retirando",
      user_id: user.id as string,
      type: 'withdraw' as OperationType
    })

    expect(statementWithdraw).toHaveProperty("id")
    expect(statementWithdraw).toHaveProperty("type", "withdraw")
    expect(statementWithdraw).toHaveProperty("user_id", user.id)
  })

  it("should not be create to statement if not exists user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 500,
        description: "Retirando",
        user_id: 'id_of_a_non-existent_user',
        type: 'withdraw' as OperationType
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be create to statement of withdraw because not funds", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Name",
        email: "user@email.com",
        password: "password"
      })

      await createStatementUseCase.execute({
        amount: 500,
        description: "Retirando",
        user_id: user.id as string,
        type: 'withdraw' as OperationType
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

})
