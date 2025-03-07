import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";
import { getIO } from "../../libs/socket";
import GetDefaultWhatsAppByUser from "../../helpers/GetDefaultWhatsAppByUser";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: number;
  queueId?: number;
  whatsappId?: number;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  whatsappId,
  companyId
}: Request): Promise<Ticket> => {

  let defaultWhatsapp = await GetDefaultWhatsAppByUser(userId);
  let useThisWhats = null;

  if(!whatsappId){

  	if (!defaultWhatsapp){
    	defaultWhatsapp = await GetDefaultWhatsApp(companyId);
        useThisWhats = defaultWhatsapp.id;
  	}else{
    	defaultWhatsapp = await GetDefaultWhatsApp(companyId);
        useThisWhats = defaultWhatsapp.id;
    }
  
  }else{
  
  	useThisWhats = whatsappId;
  }

  await CheckContactOpenTickets(contactId, useThisWhats);
  
  const { isGroup } = await ShowContactService(contactId, companyId);

  const [{ id }] = await Ticket.findOrCreate({
    where: {
      contactId,
      companyId,
      whatsappId: useThisWhats
    },
    defaults: {
      contactId,
      companyId,
      whatsappId: useThisWhats,
      status,
      isGroup,
      userId
    }
  });

  await Ticket.update(
    { companyId, queueId, userId, whatsappId: useThisWhats, status: "open" },
    { where: { id } }
  );

  const ticket = await Ticket.findByPk(id, { include: ["contact", "queue"] });

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  const io = getIO();

  io.to(ticket.id.toString()).emit("ticket", {
    action: "update",
    ticket
  });
  
  return ticket;
};

export default CreateTicketService;
