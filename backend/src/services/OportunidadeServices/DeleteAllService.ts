import Oportunidade from "../../models/Oportunidade";
import AppError from "../../errors/AppError";

const DeleteAllService = async (companyId: number): Promise<void> => {
  await Oportunidade.findAll({
    where: { companyId }
  });

  if (!Oportunidade) {
    throw new AppError("ERR_NO_RATING_FOUND", 404);
  }

  await Oportunidade.destroy({ where: {} });
};

export default DeleteAllService;
