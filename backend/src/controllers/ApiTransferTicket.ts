import { Request, Response } from "express";
import {
  WAMessage,
} from "@whiskeysockets/baileys";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import levenshtein from 'js-levenshtein';
import Fuse from 'fuse.js';

import Message from "../models/Message";
import Queue from "../models/Queue";
import Whatsapp from "../models/Whatsapp";
import Ticket from "../models/Ticket";

import ShowTicketService from "../services/TicketServices/ShowTicketService";
import ShowPlanCompanyService from "../services/CompanyService/ShowPlanCompanyService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import UpdateMessageServiceCronPending from "../services/MessageServices/UpdateMessageServiceCronPending";
import handleTypebot from "../services/WbotServices/wbotTypebot";

type MessageData = {
    body: string;
    fromMe: boolean;
    read: boolean;
    quotedMsg?: Message;
    number?: string;
    openTicket?: number;
    queueId?: number;
  };

export const transferTicket = async (req: Request, res: Response): Promise<Response> => {
    const { whatsappId } = req.query as unknown as { whatsappId: number};
    const { ticketId }   = req.query as unknown as { ticketId: number};
    const { queueId }    = req.query as unknown as { queueId: number};
    const { body }       = req.query as unknown as { body: WAMessage};

    // const messageData: MessageData = req.body;
    try {
      const whatsapp = await Whatsapp.findByPk(whatsappId);
      const ticket   = await Ticket.findByPk(ticketId);
      const queue    = await Queue.findByPk(queueId);
      const companyId = whatsapp.companyId;
      const company = await ShowPlanCompanyService(companyId);
      const sendMessageWithExternalApi = company.plan.useExternalApi
      
      if (!sendMessageWithExternalApi) {
          return res.status(400).json({ error: 'API Desabilitada. Entre em contato com o suporte para verificar nossos planos!' });  
      }
  
      if (!whatsapp) {
        throw new Error("Não foi possível realizar a operação");
      }
      if (!ticket) {
        throw new Error("Não foi possível realizar a operação");
      }
      if (!queue) {
        throw new Error("Não foi possível realizar a operação");
      }

      if(whatsapp && ticket && queue){

        await ticket.update({
          sessiontypebot:null,
          startChatTime:null,
          queueId: queueId
        });

        const queueSrv = await ShowQueueService(queue.id,ticket.companyId);
        const ticketToSend = await ShowTicketService(ticket.id, ticket.companyId);
        
        if(queueSrv?.typeChatbot === 'typebot' && queueSrv?.publicId && body !== undefined ){
          await handleTypebot(ticketToSend, body, queue)
        }else{
          if(queueSrv?.greetingMessage && queueSrv?.greetingMessage !== ''){
            const msg = await SendWhatsAppMessage({ body: `${queue.greetingMessage}`, ticket: ticketToSend });
            const updating = await UpdateMessageServiceCronPending({ ticketId: ticket.id.toString() });
          }else{
            const msg = await SendWhatsAppMessage({ body: "*Assistente Virtual*:\nAguarde enquanto localizamos um atendente... Você será atendido em breve!", ticket: ticketToSend });
            const updating = await UpdateMessageServiceCronPending({ ticketId: ticket.id.toString() });
          }
        }

      }

  
      return res.send({ mensagem: `Ticket : ${ticket.id} trasferido para fila ${queue.id} via Typebot` });
    } catch (err: any) {
      console.log(err)
    }
};

export const trasferTicketFilterText = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.query as unknown as { whatsappId: number};
  const { ticketId }   = req.query as unknown as { ticketId: number};
  const { body }       = req.query as unknown as { body: string};

  try {
    const ticket   = await Ticket.findByPk(ticketId);
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error("Não foi possível realizar a operação");
    }
    if (!ticket) {
      throw new Error("Não foi possível realizar a operação");
    }

    const allQueues = await Queue.findAll({
      attributes: ['name', "id"]
    });
    
    // Crie uma instância do Fuse
    const fuse = new Fuse(allQueues, { keys: ['name'], includeScore: true });
    
    // Converta o body para o formato de nome da fila desejado
    const queueName = body.toUpperCase();
    
    // Encontre a fila com o nome mais semelhante ao body
    const result = fuse.search(queueName);
    
    if (result.length === 0) {
      throw new Error(`Não foi possível encontrar uma fila semelhante a: ${queueName}`);
    }
    
    const mostSimilarQueue = result[0].item;

    const newBody = `{"key": "${body}"}`;
    const message = JSON.parse(newBody) as WAMessage;
    const messageString = message.key as WAMessage;

    if (!mostSimilarQueue) {
      throw new Error(`Não foi possível encontrar uma fila semelhante a: ${queueName}`);
    }
  
    if(mostSimilarQueue){
      const queueId = await Queue.findOne({
        where: {
          name: mostSimilarQueue.name
        },
        attributes: ['id'] // altere para os atributos que você deseja buscar
      });

      await ticket.update({
        sessiontypebot:null,
        startChatTime:null,
        queueId: queueId.id
      });

      const queueSrv = await ShowQueueService(queueId.id ,ticket.companyId);
      const ticketToSend = await ShowTicketService(ticket.id, ticket.companyId);

      if(queueSrv?.typeChatbot === 'typebot' && queueSrv?.publicId && body !== undefined ){
        console.log('entrei typebot ')
        await handleTypebot(ticketToSend, messageString, queueSrv)
      }else{
        if(queueSrv?.greetingMessage){
          const msg = await SendWhatsAppMessage({ body: `${queueSrv.greetingMessage}`, ticket: ticketToSend });
          const updating = await UpdateMessageServiceCronPending({ ticketId: ticket.id.toString() });
        }else{
          const msg = await SendWhatsAppMessage({ body: "*Assistente Virtual*:\nAguarde enquanto localizamos um atendente... Você será atendido em breve!", ticket: ticketToSend });
          const updating = await UpdateMessageServiceCronPending({ ticketId: ticket.id.toString() });
        }
      }



    }

    return res.send({ mensagem: `teste` });
  } catch (err: any) {
    console.log(err)
  }
};