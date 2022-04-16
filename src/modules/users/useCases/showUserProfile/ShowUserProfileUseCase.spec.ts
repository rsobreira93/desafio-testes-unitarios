import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let userRepository: InMemoryUsersRepository;

let showUserProfile: ShowUserProfileUseCase;

describe("ShowUserProfileUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    showUserProfile = new ShowUserProfileUseCase(userRepository);
  });

  it("should be able show profile", async () => {
    const user: ICreateUserDTO = {
      email: "mail@email.com",
      name: "User",
      password: "",
    };

    const { id: user_id } = await userRepository.create(user);
    const profile = await showUserProfile.execute(String(user_id));

    expect(profile.id).toEqual(user_id);
  });
});
