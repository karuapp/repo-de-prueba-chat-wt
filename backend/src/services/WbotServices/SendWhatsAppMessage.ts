import { WAMessage } from "@whiskeysockets/baileys";
import WALegacySocket from "@whiskeysockets/baileys"
import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";

import Queue from "bull";

import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}



const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
//}: Request): Promise<WAMessage> => {
}: Request): Promise<void> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket);
  let number = null;
  
  if (ticket.contact.number.length > 18) {
  
    const ultimos10: string = ticket.contact.number.slice(-10);
    const restante: string = ticket.contact.number.slice(0, -10);
    const resultadoB: string = restante + "-" + ultimos10;
    number = `${resultadoB}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
    
    //console.log(numero);
    
  }else{
  
    number = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
  
    //console.log(numero);
  
  }


  //console.log(number);
  //console.log(ticket.contact);

  if (quotedMsg) {
      const chatMessages = await Message.findOne({
        where: {
          id: quotedMsg.id
        }
      });

      if (chatMessages) {
        const msgFound = JSON.parse(chatMessages.dataJson);

        options = {
          quoted: {
            key: msgFound.key,
            message: {
              extendedTextMessage: msgFound.message.extendedTextMessage
            }
          }
        };
      }
      //console.log(chatMessages)
    
  }

  try {
  
  	const emfila = await Setting.findOne({
    	where: { key: "emfila", companyId: 1 },
    });
  
  	

    if (emfila && emfila.value === "enabled") {
    
    const connection = process.env.REDIS_URI || "";

  	const sendScheduledMessagesWbot = new Queue(
    	"SendWbotMessages",
  		connection
  	);
    
    const messageData = {
        wbotId: wbot.id,
  		number: number,
  		text: formatBody(body, ticket.contact),
  		options: { ...options }
	};
  
    const sentMessage = sendScheduledMessagesWbot.add("SendMessageWbot", { messageData }, { delay: 500 });
    logger.info("Mensagem enviada via REDIS...");
  
    await ticket.update({ lastMessage: formatBody(body, ticket.contact) });
    return;
    
    
    
    }else{
  
  
    const sentMessage = await wbot.sendMessage(number,{
        text: formatBody(body, ticket.contact)
      },
      {
        ...options
      }
    );
    
 
    await ticket.update({ lastMessage: formatBody(body, ticket.contact) });
    return; 
    
    
    }
    
  
   
  
  
  
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
