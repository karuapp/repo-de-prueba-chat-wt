import { findByEmail } from "../../controllers/UserController";
import User from "../../models/User";
import FindUserByEmailService from "./FindUserByEmailService";

const UpdatePasswordUserService = async (email: string, password: string): Promise<User | null> => {
  const user = await FindUserByEmailService(email);
  user.update({
    password: password
  });

  return user ?? null;
};

export default UpdatePasswordUserService;
