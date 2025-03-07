import { proto, WASocket } from "@whiskeysockets/baileys";
import Contact from '../../models/Contact';
import Ticket from '../../models/Ticket';
import Queue from '../../models/Queue';


type Session = WASocket & {
    id?: number;
  };

export const n8nBot = async (
    ticket: Ticket,
    msg: proto.IWebMessageInfo,
    companyId: number,
    contact: Contact,
    wbot: Session,
) => {


    const IntegrationQueue =  await Queue.findByPk(ticket.queueId,{
        attributes: ['n8n']
      })
      const request = require("request");
    
      if (IntegrationQueue.n8n ) {
        const options = {
          method: "POST",
          url: IntegrationQueue.n8n,
          headers: {
            "Content-Type": "application/json"
          },
          json: msg
        };
        try {
          const response = await request(options);
        } catch (error) {
          throw new Error(error);
        }
      }


}