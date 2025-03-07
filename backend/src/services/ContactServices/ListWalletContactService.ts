import { Sequelize, Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  companyId: number;
  walleteUserId?: number
  profileUser?: string
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListWalletContactService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  walleteUserId,
  profileUser
}: Request): Promise<Response> => {
  let whereCondition: any = {
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      },
      { number: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` } }
    ],
    companyId: {
      [Op.eq]: companyId
    }
  };

  // Se o perfil do usuário não for "admin", aplicar a condição walleteUserId
  if (profileUser !== 'admin' && profileUser !== 'supervisor') {
    whereCondition = {
      ...whereCondition,
      walleteUserId: {
        [Op.eq]: walleteUserId 
      }
    };
  } else {
    // Se o usuário for admin, buscamos apenas os registros onde walleteUserId não é nulo
    whereCondition = {
      ...whereCondition,
      walleteUserId: {
        [Op.not]: null 
      }
    };
  }
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit,
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: ["id", "status", "createdAt", "updatedAt"]
      }
    ],
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};

export default ListWalletContactService;
