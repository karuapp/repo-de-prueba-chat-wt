import Oportunidade from "../../models/Oportunidade";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string | number, companyId: number): Promise<void> => {
  const oportunidade = await Oportunidade.findOne({
    where: { id, companyId }
  });

  if (!oportunidade) {
    throw new AppError("ERR_NO_OPORTUNIDADE_FOUND", 404);
  }

  await oportunidade.destroy();
};

export default DeleteService;
