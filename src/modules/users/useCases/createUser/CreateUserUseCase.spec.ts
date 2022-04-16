import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("CreateUserUseCase", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "email@mail.com",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
  });
});
