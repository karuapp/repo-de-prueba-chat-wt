import { getIO } from "../../libs/socket";
import ShowTicketServiceExt from "../TicketServices/ShowTicketServiceExt";

interface Request {
  ticketId: string; 
}

const UpdateMessageServiceCronPending = async ({
  ticketId, 
}: Request): Promise<void> => {

  const message = null;

  console.log(ticketId);

  const ticket = await ShowTicketServiceExt(ticketId);

  const io = getIO();




  io.emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket
      });

      io.emit(`company-${ticket.companyId}-ticket`, {
        action: "delete",
        ticketId: ticket.id
      });
/*
  io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "removeFromList",
        ticket,
        ticketId: ticket.id,
      })

	  io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "updateUnread",
        ticketId: ticket.id,
      })


  io.to(ticketId.toString())
    .to(ticket.status.toString())
    .to("notification")
    .emit(`company-${ticket.companyId}-appMessage`, {
      action: "create",
      message,
      ticket,
      contact: ticket.contact
    });
    
*/

  return;
};

export default UpdateMessageServiceCronPending;
