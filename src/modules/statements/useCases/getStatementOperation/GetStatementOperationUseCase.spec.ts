import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  })

  it("should be get statement operation from user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Name",
      email: "user@email.com",
      password: "password"
    })

    const statement = await createStatementUseCase.execute({
      amount: 550.50,
      description: "depositando",
      user_id: user.id as string,
      type: 'deposit' as OperationType
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    })

    expect(statementOperation).toHaveProperty("id")
    expect(statementOperation).toHaveProperty("amount", 550.50)
  })

  it("should not be get statement operation from user non-existent", async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Name",
        email: "user@email.com",
        password: "password"
      })

      const statement = await createStatementUseCase.execute({
        amount: 550.50,
        description: "depositando",
        user_id: user.id as string,
        type: 'deposit' as OperationType
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id + 'id_not_exists',
        statement_id: statement.id as string
      })
    }).rejects.toEqual({ message: "User not found", statusCode: 404 })
  })

  it("should not be get statement operation from statement non-existent", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Name",
        email: "user@email.com",
        password: "password"
      })

      const statement = await createStatementUseCase.execute({
        amount: 550.50,
        description: "depositando",
        user_id: user.id as string,
        type: 'deposit' as OperationType
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: statement.id + 'id_not_exists'
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })

})
