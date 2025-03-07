import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

interface Params {
  companyId: string | number;
}

const SimpleListService = async ({ companyId }: Params): Promise<User[]> => {
  const users = await User.findAll({
    where: {
      companyId
    },
    attributes: ["name", "id", "email"],
    include: [
      { model: Queue, as: 'queues' },
      { model: Whatsapp, as: "wbots", attributes: ["id", "name"] }
    ],
    order: [["id", "ASC"]]
  });

  if (!users) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return users;
};

export default SimpleListService;
