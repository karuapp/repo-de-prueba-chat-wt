import { Sequelize, Op } from "sequelize";
import Oportunidade from "../../models/Oportunidade";

interface Request {
  companyId: number
  searchParam?: string;
}

const ListService = async ({ searchParam, companyId }: Request): Promise<Oportunidade[]> => {
  let whereCondition = {};

  if (searchParam) {
    whereCondition = {
      [Op.or]: [{ name: { [Op.like]: `%${searchParam}%` } }]
    };
  }

  const ratings = await Oportunidade.findAll({
    where: {companyId, ...whereCondition},
    order: [["name", "ASC"]],
    attributes: {
      exclude: ["createdAt", "updatedAt"]
    },
    group: ["Oportunidade.id"]
  });

  return ratings;
};

export default ListService;
