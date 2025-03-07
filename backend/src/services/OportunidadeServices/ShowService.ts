import Oportunidade from "../../models/Oportunidade";
import AppError from "../../errors/AppError";

const OportunidadeService = async (id: string | number, companyId: number): Promise<Oportunidade> => {
  const rating = await Oportunidade.findOne({
    where: { id, companyId },
    attributes: ["id", "name","companyId", "funil", "ticketInfo","tagId","ticketId", "etapadofunil", "fonte", "campanha", "datadeida", "datadevolta", "origem", "destino", "valor", "produto"],
  });

  if (!rating) {
    throw new AppError("ERR_NO_OPORTUNIDADE_FOUND", 404);
  }

  return rating;
};

export default OportunidadeService;
