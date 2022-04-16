import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
let userRepository: InMemoryUsersRepository;
let statementRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("CreateStatementUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
  });

  it("Should be able to create a new Statement", async () => {
    const user: ICreateUserDTO = {
      name: "Statement Test",
      email: "statement@email.com",
      password: "passTest",
    };

    const newUser = await userRepository.create(user);

    const idUser = String(newUser.id);

    const newDeposit = {
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "energy",
    };

    const newStatementDeposit = await createStatementUseCase.execute({
      user_id: idUser,
      type: newDeposit.type,
      amount: newDeposit.amount,
      description: newDeposit.description,
    });

    const newWithdrawal = {
      type: OperationType.WITHDRAW,
      amount: 10,
      description: "Parking",
    };

    const newStatementWithdrawal = await createStatementUseCase.execute({
      user_id: idUser,
      type: newWithdrawal.type,
      amount: newWithdrawal.amount,
      description: newWithdrawal.description,
    });

    expect(newStatementDeposit).toHaveProperty("id");
    expect(newStatementWithdrawal).toHaveProperty("id");
  });

  it("Should not to able to create a new Deposit a user failed", () => {
    expect(async () => {
      const newDeposit = {
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Pix",
      };

      await createStatementUseCase.execute({
        user_id: "non-existing-user-id",
        type: newDeposit.type,
        amount: newDeposit.amount,
        description: newDeposit.description,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not to able to create a new Withdrawal a user failed", () => {
    expect(async () => {
      const newWithdrawal = {
        type: OperationType.WITHDRAW,
        amount: 10,
        description: "parking",
      };

      await createStatementUseCase.execute({
        user_id: "non-existing-user-id",
        type: newWithdrawal.type,
        amount: newWithdrawal.amount,
        description: newWithdrawal.description,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to create a new withdrawal with a balance less than the amount", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "statement negative",
        email: "statementnegative@email.com",
        password: "passTestNeg",
      };

      const newUser = await userRepository.create(user);

      const newWithdrawal = {
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "energy",
      };

      await createStatementUseCase.execute({
        user_id: newUser.id as string,
        type: newWithdrawal.type,
        amount: newWithdrawal.amount,
        description: newWithdrawal.description,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
