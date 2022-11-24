import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { TransferStatementUseCase } from './TransferStatementUseCase';

export class TransferBalanceController {
  async execute(request: Request, response: Response) {
    const { id } = request.user;
    const { user_id } = request.params;
    const { amount, description } = request.body;

    const transferStatement = container.resolve(TransferStatementUseCase);

    const balance = await transferStatement.execute({ id, user_id, amount, description });

    return response.json(balance);
  }
}
