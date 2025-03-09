import {
  WAMessage,
} from "@whiskeysockets/baileys";
import axios from "axios";
import { isNil } from "lodash";
import mime from "mime-types";
import fs from "fs"

import Queue from "../../models/Queue";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";

import { getBodyMessage } from "./wbotMessageListener";
import { TypebotService } from "../TypebotService/apiTypebotService";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import SendWhatsAppMedia from "./SendWhatsAppMedia";
import path from "path";
import { Readable } from "stream";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import User from "../../models/User";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import { getIO } from "../../libs/socket";
import ShowTicketService from "../TicketServices/ShowTicketService";


const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  });
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function baixarESalvarArquivo(url) {
  try {
    const resposta = await axios({
      url: url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    // Inferir a extensão com base no tipo de conteúdo
    const extensao = mime.extension(resposta.headers['content-type']) || '.bin';

    const outputFile = `${publicFolder}/${new Date().getTime()}.${extensao}`;

    // const arrayDeBytes = new Uint8Array(resposta.data);
    // const buffer = Buffer.from(arrayDeBytes);
    const buffer = Buffer.from(resposta.data);

    // Escrever o Buffer no arquivo
    fs.writeFileSync(outputFile, buffer);

    // Criar arquivo Simulado Tipo Multer File para não ter que criar outro envio de media
    const arquivoSimuladoTipoMulterFile = {
      fieldname: 'arquivo',
      originalname: path.basename(outputFile),
      encoding: '7bit',
      mimetype: resposta.headers['content-type'],
      destination: url,
      filename: path.basename(outputFile),
      path: outputFile,
      size: buffer.length,
      buffer: buffer,
      stream: Readable.from(buffer),
    };
    return arquivoSimuladoTipoMulterFile

  } catch (erro) {
    console.error('Erro ao baixar o arquivo:', erro);
    throw new erro;
  }
}
const startChat = async (msgBody, ticket, typebot) => {
  const requestData = await TypebotService.startChat(msgBody, typebot, ticket, ticket.companyId)
  const { sessionId } = requestData
  if (sessionId) {
    await ticket.update({
      sessiontypebot: sessionId,
      startChatTime: new Date()
    })
  }

  return requestData
}

const continueChat = async (msgBody, ticket) => {
  return TypebotService.continueChat(msgBody, ticket.sessiontypebot, ticket.companyId)
}

const SendMessageReturnTypebot = async (requestData, ticket, resetChatbotMsg) => {



  const messages = requestData.messages
  for (const message of messages) {

    const clientSideActions = requestData.clientSideActions;


    if (message.type === 'text') {
      let formattedText = '';
      for (const richText of message.content.richText) {
        for (const element of richText.children) {
          let text = '';
          if (element.type === 'inline-variable') {
            for (let i = 0; i < element.children.length; i++) {
              if (element && element.children && element.children[i]) {
                text = element.children[i].children[i].text;
              }
            }
          }
          if (element.text) {
            text = element.text;
          }
          if (element.bold) {
            text = `*${text}*`;
          }
          if (element.italic) {
            text = `_${text}_`;
          }
          if (element.underline) {
            text = `~${text}~`;
          }
          formattedText += text;
        }
        formattedText += '\n';
      }
      formattedText = formattedText.replace(/\n$/, '');



      const isAction = await handleVerifyActionFromTypebot(formattedText, ticket);

      if (!isAction) {

        // await wbot.sendPresenceUpdate('composing', remoteJid)

        await SendWhatsAppMessage({
          body: formattedText,
          ticket,
          quotedMsg: null
        })



      }



    }

    if (message.type === 'image' || message.type === 'video' || message.type === 'audio') {
      try {
        const media = await baixarESalvarArquivo(message.content.url)
        await SendWhatsAppMedia({
          media,
          ticket,
          body: media.filename
        })

      } catch (e) { }
    }
  }
  const input = requestData.input
  if (input) {
    if (input.type === 'choice input') {
      let formattedText = '';
      const items = input.items;
      for (const item of items) {
        formattedText += `▶ ${item.content}\n`;
      }
      formattedText = formattedText.replace(/\n$/, '');
      await SendWhatsAppMessage({
        body: formattedText,
        ticket,
        quotedMsg: null
      })
      //await timer(rndInt * 1000)
    }
  }
  if (resetChatbotMsg) {
    await SendWhatsAppMessage({
      body: `* # * - Menu inicial`,
      ticket,
      quotedMsg: null
    })
  }
}

const handleTypebot = async (ticket: Ticket, msg: WAMessage, queue: Queue) => {

  let possuiSession: Boolean = true;

  const typebot = queue.publicId
  //const typebot = "pesquisa-de-satisfa";

  const timer = ms => new Promise(res => setTimeout(res, ms))

  const contentMsgboby = await getBodyMessage(msg)

  const rndInt = randomIntFromInterval(1, 3)

  await timer(rndInt * 1000)

  possuiSession = !isNil(ticket.sessiontypebot)

  if (contentMsgboby == "00") {
    possuiSession = false;

    await ticket.update({
      sessiontypebot: null,
      startChatTime: null
    })
  }

  const requestTypeBot = possuiSession
    ? await continueChat(contentMsgboby, ticket)
    : await startChat(contentMsgboby, ticket, typebot);
  if (requestTypeBot) {
    delay(2000, await SendMessageReturnTypebot(requestTypeBot, ticket, queue.resetChatbotMsg))
  }
}

const handleVerifyActionFromTypebot = async (msg, ticket: Ticket) => {

  // fazer as verificações se a fila / usuario pertence a empresa.
  const companyId = ticket.companyId;

  if (msg.startsWith("#queue=")) {

    const queues = await Queue.findAll({ where: { companyId } });
    let gatilhoQueue = msg.replace("#queue=", "");

    const fromThisCompany = queues.find((queue) => queue.id === parseInt(gatilhoQueue));

    if (!fromThisCompany) {
      throw new Error("Fila Escolhida no typebot não pertence a empresa");
    }

    let jsonGatilhoQueue = JSON.parse(gatilhoQueue);
    if (jsonGatilhoQueue && jsonGatilhoQueue > 0) {

      await UpdateTicketService({
        ticketData: {
          queueId: jsonGatilhoQueue,
          chatbot: false,
          sessiontypebot: null,
          startChatTime: null,
        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });

      await ticket.update({
        chatbot: false
      });

      await ticket.reload();

      return true;
    }

  }

  if (msg.startsWith("#tag=")) {

    const tags = await Tag.findAll({ where: { companyId } });
    let gatilhoQueue = msg.replace("#tag=", "");

    const fromThisCompany = tags.find((tag) => tag.id === parseInt(gatilhoQueue));

    if (!fromThisCompany) {
      throw new Error("Tag Escolhida no typebot não pertence a empresa");
    }

    let jsonGatilhoQueue = JSON.parse(gatilhoQueue);
    if (jsonGatilhoQueue && jsonGatilhoQueue > 0) {

      TicketTag.create({
        tagId: jsonGatilhoQueue,
        ticketId: ticket.id
      });

      const ticketSocket = await ShowTicketService(ticket.id, companyId);

      const io = getIO();
      io.to(`company-${companyId}-${ticket.status}`)
        .to(`queue-${ticket.queueId}-${ticket.status}`)
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket: ticketSocket
        });

      return true;
    }

  }

  if (msg.startsWith("#user=")) {


    let gatilhoUser = msg.replace("#user=", "");

    const users = await User.findAll({ where: { companyId } });
    const fromThisCompany = users.find((user) => user.id === parseInt(gatilhoUser));

    if (!fromThisCompany) {
      throw new Error("Usuário Escolhido no typebot não pertence a empresa");
    }

    let jsonGatilhoUser = JSON.parse(gatilhoUser);
    if (jsonGatilhoUser && jsonGatilhoUser > 0) {
      await UpdateTicketService({
        ticketData: {
          status: "open",
          userId: jsonGatilhoUser,
          chatbot: false,

        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });

      return true;
    }

  }

  if (msg.startsWith("#close")) {

    await UpdateTicketService({
      ticketData: {
        status: "closed",
        queueId: null,
        userId: null
      },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    // finaliza a sessão do typebot
    await ticket.update({
      sessiontypebot: null,
      startChatTime: null
    })

    return true;

  }

  return false;

};

export default handleTypebot;
