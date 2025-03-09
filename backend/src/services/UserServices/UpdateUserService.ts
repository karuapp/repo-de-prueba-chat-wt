import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import ShowUserService from "./ShowUserService";
import Company from "../../models/Company";
import User from "../../models/User";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  profile?: string;
  companyId?: number;
  SuperIs?: boolean;
  queueIds?: number[];
  whatsappId?: number;
  farewellMessage?: string;
  wbotIds?: number[];
}


interface Request {
  userData: UserData;
  userId: string | number;
  companyId: number;
  requestUserId: number;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
}

const UpdateUserService = async ({
  userData,
  userId,
  companyId,
  requestUserId
}: Request): Promise<Response | undefined> => {
  const user = await ShowUserService(userId);

  const requestUser = await User.findByPk(requestUserId);

  if (requestUser.super === false && userData.companyId !== companyId) {
    throw new AppError("O usuário não pertence à esta empresa");
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email(),
    profile: Yup.string(),
    password: Yup.string()
  });

  const { email, password, profile, name, queueIds = [], whatsappId, SuperIs, farewellMessage, wbotIds = [] } = userData;

  //console.log("SUPER VALUE:");
  //console.log(SuperIs);

  try {
    await schema.validate({ email, password, profile, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  let updatedProfile = profile; // Initialize a new variable to store the updated value


  if (SuperIs == true) {
    updatedProfile = "admin"; // Update the new variable instead of the constant
  }

  if (user.id === 1) {

    await user.update({
      email,
      password,
      profile: "admin",
      name,
      whatsappId: whatsappId ? whatsappId : null,
      super: true,
      farewellMessage
    });

  } else {

    await user.update({
      email,
      password,
      profile: updatedProfile,
      name,
      whatsappId: whatsappId ? whatsappId : null,
      super: SuperIs ? SuperIs : false,
      farewellMessage
    });

  }


  await user.$set("queues", queueIds);
  await user.$set("wbots", wbotIds);

  await user.reload();

  const company = await Company.findByPk(user.companyId);

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    company,
    super: user.super,
    queues: user.queues,
    whatsapp: user.whatsapp,
    greetingMessage: user.farewellMessage,
    wbots: user.wbots
  };

  //console.log(serializedUser);
  return serializedUser;
};

export default UpdateUserService;
