import { Op } from 'sequelize';
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import sequelize from '../../database';
import Contact from '../../models/Contact';
import Queue from '../../models/Queue';
import User from '../../models/User';
import Whatsapp from '../../models/Whatsapp';

interface Request {
  tags: Tag[];
  ticketId: number;
}

const SyncTags = async ({ tags, ticketId }: Request): Promise<Ticket | null> => {
  try {

    const ticket = await Ticket.findByPk(ticketId, { include: [Tag] });

    if (!ticket) {
      throw new Error('Ticket não encontrado.');
    }

    const tagList = tags.map(tag => ({ tagId: tag.id, ticketId }));

    await sequelize.transaction(async (transaction) => {

      await TicketTag.destroy({ where: { ticketId }, transaction });

      await TicketTag.bulkCreate(tagList, { transaction });

      await ticket.reload({ include: [Tag,Contact,Queue,User,Whatsapp], transaction });
    });

    return ticket;
  } catch (error) {
    console.error('Erro ao sincronizar tags:', error);
    return null;
  }
};

export default SyncTags;
