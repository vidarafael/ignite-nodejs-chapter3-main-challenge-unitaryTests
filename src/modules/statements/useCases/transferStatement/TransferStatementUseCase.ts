import { GetBalanceError } from './../getBalance/GetBalanceError';
import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { v4 as uuidV4 } from 'uuid';

interface IRequest {
  id: string;
  user_id: string;
  amount: number;
  description: string;
}

interface IResponse {
  id: string;
  sender_id: string;
  amount: number;
  description: string;
  type: string;
  created_at: Date,
  updated_at: Date
}

@injectable()
export class TransferStatementUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }

  async execute({ id, user_id, amount, description }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new GetBalanceError();
    }

    const transferUser = await this.usersRepository.findById(user_id);

    if (!transferUser) {
      throw new GetBalanceError();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: id })


    if (balance < amount) {
      throw new GetBalanceError();
    }

    await this.statementsRepository.create({ user_id: id, amount, type: "withdraw" as OperationType, description })
    await this.statementsRepository.create({ user_id, amount, type: 'deposit' as OperationType, description })

    return {
      id: uuidV4(),
      sender_id: user_id,
      amount,
      description,
      type: "transfer",
      created_at: new Date(),
      updated_at: new Date()
    }
  }
}
