import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";
import { isNil, isNull, head } from "lodash";

import {
  Chat,
  WASocket,
  downloadContentFromMessage,
  extractMessageContent,
  getContentType,
  jidNormalizedUser,
  MediaType,
  MessageUpsertType,
  proto,
  WAMessage,
  BinaryNode,
  WAMessageStubType,
  WAMessageUpdate,
} from "@whiskeysockets/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import formatBody from "../../helpers/Mustache";
import { Store } from "../../libs/store";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import { Op } from "sequelize";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import User from "../../models/User";
import Setting from "../../models/Setting";
import Baileys from "../../models/Baileys";
import { getWbot } from "../../libs/wbot";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { CreateOrUpdateBaileysChatService } from "../BaileysChatServices/CreateOrUpdateBaileysChatService";
import { ShowBaileysChatService } from "../BaileysChatServices/ShowBaileysChatService";
import Whatsapp from "../../models/Whatsapp";
import Rating from "../../models/Rating";
import RatingOption from "../../models/RatingOption";

//const puppeteer = require('puppeteer');
const fs = require('fs')
const path = require('path');
var axios = require('axios');

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

interface IMessage {
  messages: WAMessage[];
  isLatest: boolean;
}

const isNumeric = (value: string) => /^-?\d+$/.test(value);

const writeFileAsync = promisify(writeFile);

const multVecardGet = function (param: any) {
  let output = " "

  let name = param.split("\n")[2].replace(";;;", "\n").replace('N:', "").replace(";", "").replace(";", " ").replace(";;", " ").replace("\n", "")
  let inicio = param.split("\n")[4].indexOf('=')
  let fim = param.split("\n")[4].indexOf(':')
  let contact = param.split("\n")[4].substring(inicio + 1, fim).replace(";", "")
  let contactSemWhats = param.split("\n")[4].replace("item1.TEL:", "")
  //console.log(contact);
  if (contact != "item1.TEL") {
    output = output + name + ": 📞" + contact + "" + "\n"
  } else
    output = output + name + ": 📞" + contactSemWhats + "" + "\n"
  return output
}

const contactsArrayMessageGet = (msg: any,) => {
  let contactsArray = msg.message?.contactsArrayMessage?.contacts
  let vcardMulti = contactsArray.map(function (item, indice) {
    return item.vcard;
  });

  let bodymessage = ``
  vcardMulti.forEach(function (vcard, indice) {
    bodymessage += vcard + "\n\n" + ""
  })

  let contacts = bodymessage.split("BEGIN:")

  contacts.shift()
  let finalContacts = ""
  for (let contact of contacts) {
    finalContacts = finalContacts + multVecardGet(contact)
  }

  return finalContacts
}

const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  const msgType = getContentType(msg.message);
  if (msg.message?.viewOnceMessageV2) {
    return "viewOnceMessageV2"
  }
  return msgType
};

/*
const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  return getContentType(msg.message);
};
*/

function validaCpfCnpj(val) {
  if (val.length == 11) {
    var cpf = val.trim();

    cpf = cpf.replace(/\./g, '');
    cpf = cpf.replace('-', '');
    cpf = cpf.split('');

    var v1 = 0;
    var v2 = 0;
    var aux = false;

    for (var i = 1; cpf.length > i; i++) {
      if (cpf[i - 1] != cpf[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (var i = 0, p = 10; (cpf.length - 2) > i; i++, p--) {
      v1 += cpf[i] * p;
    }

    v1 = ((v1 * 10) % 11);

    if (v1 == 10) {
      v1 = 0;
    }

    if (v1 != cpf[9]) {
      return false;
    }

    for (var i = 0, p = 11; (cpf.length - 1) > i; i++, p--) {
      v2 += cpf[i] * p;
    }

    v2 = ((v2 * 10) % 11);

    if (v2 == 10) {
      v2 = 0;
    }

    if (v2 != cpf[10]) {
      return false;
    } else {
      return true;
    }
  } else if (val.length == 14) {
    var cnpj = val.trim();

    cnpj = cnpj.replace(/\./g, '');
    cnpj = cnpj.replace('-', '');
    cnpj = cnpj.replace('/', '');
    cnpj = cnpj.split('');

    var v1 = 0;
    var v2 = 0;
    var aux = false;

    for (var i = 1; cnpj.length > i; i++) {
      if (cnpj[i - 1] != cnpj[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (var i = 0, p1 = 5, p2 = 13; (cnpj.length - 2) > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v1 += cnpj[i] * p1;
      } else {
        v1 += cnpj[i] * p2;
      }
    }

    v1 = (v1 % 11);

    if (v1 < 2) {
      v1 = 0;
    } else {
      v1 = (11 - v1);
    }

    if (v1 != cnpj[12]) {
      return false;
    }

    for (var i = 0, p1 = 6, p2 = 14; (cnpj.length - 1) > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v2 += cnpj[i] * p1;
      } else {
        v2 += cnpj[i] * p2;
      }
    }

    v2 = (v2 % 11);

    if (v2 < 2) {
      v2 = 0;
    } else {
      v2 = (11 - v2);
    }

    if (v2 != cnpj[13]) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(time) {
  await timeout(time);
}

const sendMessageImage = async (
  wbot: Session,
  contact,
  ticket: Ticket,
  url: string,
  caption: string
) => {

  let sentMessage
  try {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        image: url ? { url } : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
        fileName: caption,
        caption: caption,
        mimetype: 'image/jpeg'
      }
    );
  } catch (error) {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: formatBody('Não consegui enviar o PDF, tente novamente!', contact)
      }
    );
  }
  verifyMessage(sentMessage, ticket, contact);
};

const sendMessageLink = async (
  wbot: Session,
  contact: Contact,
  ticket: Ticket,
  url: string,
  caption: string
) => {

  let sentMessage
  try {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
      document: url ? { url } : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
      fileName: caption,
      caption: caption,
      mimetype: 'application/pdf'
    }
    );
  } catch (error) {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
      text: formatBody('Não consegui enviar o PDF, tente novamente!', contact)
    }
    );
  }
  verifyMessage(sentMessage, ticket, contact);
};

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


const getBodyButton = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message.buttonsMessage?.contentText) {
    let bodyMessage = `*${msg?.message?.buttonsMessage?.contentText}*`;

    for (const buton of msg.message?.buttonsMessage?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }
    return bodyMessage;
  }

  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.listMessage?.description}*`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }

    return bodyMessage;
  }
};
const getBodyList = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message.listMessage?.description) {
    let bodyMessage = `*${msg.message.listMessage?.description}*`;
    for (const buton of msg.message.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }

  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.listMessage?.description}*`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }

    return bodyMessage;
  }
};

const msgLocation = (image, latitude, longitude) => {
  if (image) {
    var b64 = Buffer.from(image).toString("base64");

    let data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
    return data;
  }
};

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {

  try {
    let type = getTypeMessage(msg);

    const types = {
      conversation: msg.message.conversation,
      imageMessage: msg.message.imageMessage?.caption,
      videoMessage: msg.message.videoMessage?.caption,
      extendedTextMessage: msg.message.extendedTextMessage?.text,
      buttonsResponseMessage: msg.message.buttonsResponseMessage?.selectedButtonId,
      templateButtonReplyMessage: msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo: msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.title,
      buttonsMessage: getBodyButton(msg) || msg.message.buttonsMessage?.contentText,
      viewOnceMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage?.vcard,
      contactsArrayMessage: (msg.message?.contactsArrayMessage?.contacts) && contactsArrayMessageGet(msg),
      //locationMessage: `Latitude: ${msg.message.locationMessage?.degreesLatitude} - Longitude: ${msg.message.locationMessage?.degreesLongitude}`,
      locationMessage: msgLocation(
        msg.message?.locationMessage?.jpegThumbnail,
        msg.message?.locationMessage?.degreesLatitude,
        msg.message?.locationMessage?.degreesLongitude
      ),
      liveLocationMessage: `Latitude: ${msg.message.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message?.documentMessage?.title,
      documentWithCaptionMessage: msg.message?.documentWithCaptionMessage?.message?.documentMessage?.caption,
      audioMessage: "Áudio",
      listMessage: getBodyList(msg) || msg.message.listResponseMessage?.title,
      listResponseMessage: msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      reactionMessage: msg.message.reactionMessage?.text || "reaction",
      senderKeyDistributionMessage: msg.message.senderKeyDistributionMessage?.axolotlSenderKeyDistributionMessage,
      viewOnceMessageV2: msg.message?.viewOnceMessageV2?.message?.imageMessage?.caption

    };

    //console.log(msg);

    const objKey = Object.keys(types).find(key => key === type);

    if (!objKey) {
      logger.warn(`#### Nao achou o type 152: ${type}
      ${JSON.stringify(msg)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
      Sentry.captureException(
        new Error("Novo Tipo de Mensagem em getTypeMessage")
      );
    }

    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
    Sentry.captureException(error);
    console.log(error);
  }
};


export const getQuotedMessage = (msg: proto.IWebMessageInfo): any => {
  const body =
    msg.message.imageMessage.contextInfo ||
    msg.message.videoMessage.contextInfo ||
    msg.message?.documentMessage ||
    msg.message.extendedTextMessage.contextInfo ||
    msg.message.buttonsResponseMessage.contextInfo ||
    msg.message.listResponseMessage.contextInfo ||
    msg.message.templateButtonReplyMessage.contextInfo ||
    msg.message.buttonsResponseMessage?.contextInfo ||
    msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
    msg.message.listResponseMessage?.contextInfo ||
    msg.message.senderKeyDistributionMessage;

  // testar isso

  return extractMessageContent(body[Object.keys(body).values().next().value]);
};
export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];

  return body?.contextInfo?.stanzaId;
};

export const getMeSocket = (wbot: Session): IMe => {
  return {
    id: jidNormalizedUser((wbot as WASocket).user.id),
    name: (wbot as WASocket).user.name
  };
};

const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;

  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid || undefined;

  return senderId && jidNormalizedUser(senderId);
};

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");

  return isGroup
    ? {
        id: getSenderMessage(msg, wbot),
        name: msg.pushName
      }
    : {
        id: msg.key.remoteJid,
        name: msg.key.fromMe ? rawNumber : msg.pushName
      };
};

const downloadMedia = async (msg: proto.IWebMessageInfo) => {
  const mineType =

    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage

  const messageType = msg.message?.documentMessage

    ? "document"
    : mineType.mimetype.split("/")[0].replace("application", "document")
      ? (mineType.mimetype
        .split("/")[0]
        .replace("application", "document") as MediaType)
      : (mineType.mimetype.split("/")[0] as MediaType);

  let stream;
  let contDownload = 0;

  while (contDownload < 10 && !stream) {
    try {
      stream = await downloadContentFromMessage(
        msg.message.audioMessage ||
        msg.message.videoMessage ||
        msg.message.documentMessage ||
        msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
        msg.message.imageMessage ||
        msg.message.stickerMessage ||
        msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage ||
        msg.message?.buttonsMessage?.imageMessage ||
        msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
        msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
        msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
        msg.message?.viewOnceMessageV2?.message?.imageMessage ||
        msg.message?.interactiveMessage?.header?.imageMessage,
        messageType
      );
    } catch (error) {
      contDownload++;
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * contDownload * 2)
      );
      logger.warn(
        `>>>> erro ${contDownload} de baixar o arquivo ${msg?.key.id}`
      );
    }
  }


  let buffer = Buffer.from([]);
  // eslint-disable-next-line no-restricted-syntax
  try {
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
  } catch (error) {
    return { data: "error", mimetype: "", filename: "" };
  }

  if (!buffer) {
    Sentry.setExtra("ERR_WAPP_DOWNLOAD_MEDIA", { msg });
    Sentry.captureException(new Error("ERR_WAPP_DOWNLOAD_MEDIA"));
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }
  let filename = msg.message?.documentMessage?.fileName || "";

  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  }
  const media = {
    data: buffer,
    mimetype: mineType.mimetype,
    filename
  };
  return media;
};


const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {

  let profilePicUrl: string;
  try {
    profilePicUrl = await wbot.profilePictureUrl(msgContact.id);
  } catch (e) {
    Sentry.captureException(e);
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  const contactData = {
    name: msgContact?.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId,
  };


  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = getQuotedMessageId(msg);

  if (!quoted) return null;

  const quotedMsg = await Message.findOne({
    where: { id: quoted },
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const media = await downloadMedia(msg);

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  }

  try {

    const folder = `public/company${ticket.companyId}`;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
      fs.chmodSync(folder, 0o777)
    }

    await writeFileAsync(
      join(__dirname, "..", "..", "..", folder, media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }

  const body = getBodyMessage(msg);

  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body: body ? body : media.filename,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg),
  };

  await ticket.update({
    lastMessage: body || media.filename,
  });

  const newMessage = await CreateMessageService({
    messageData,
    companyId: ticket.companyId,
  });

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" },
      ],
    });

    io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id,
    });

    io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id,
      });

    //COMENTARIO
    //console.log("linha 723 - wbot");

  }

  return newMessage;
};

export const verifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {

  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const body = getBodyMessage(msg);

  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg)
  };

  await ticket.update({
    lastMessage: body
  });

  await CreateMessageService({ messageData, companyId: ticket.companyId });


  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });

    io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    /*

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });

    */

    //COMENTARIO
    //console.log("linha 787 - wbot");
  }
};

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return;
    }

    const ifType =
      msgType === "conversation" ||
      msgType === "extendedTextMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "documentWithCaptionMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "viewOnceMessageV2" ||
      msgType === "contactsArrayMessage" ||
      msgType === "viewOnceMessage";

    //logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
    //${JSON.stringify(msg?.message)}`);

    if (!ifType) {
      logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
    ${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
      Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
    }

    return !!ifType;
  } catch (error) {
    Sentry.setExtra("Error isValidMsg", { msg });
    Sentry.captureException(error);
  }
};


const Push = (msg: proto.IWebMessageInfo) => {
  return msg.pushName;
}

const verifyQueue = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage } = await ShowWhatsAppService(
    wbot.id!,
    ticket.companyId
  );
  if (queues.length === 1 ) {
    const firstQueue = head(queues);
    let chatbot = false;

    if (firstQueue?.options) {
      chatbot = firstQueue.options.length > 0;

    }

    await UpdateTicketService({
      ticketData: { queueId: firstQueue?.id, chatbot },
      ticketId: ticket.id,
      companyId: ticket.companyId,
    });

    if (greetingMessage && !ticket.isGroup && !chatbot) {
      const listMessage = {
        text: formatBody(`\u200e${greetingMessage}`, ticket.contact),
      };

      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        listMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);
    }

    return;
  }

  const selectedOption = getBodyMessage(msg);
  const choosenQueue = queues[+selectedOption - 1];

  const companyId = ticket.companyId;

  const buttonActive = await Setting.findOne({
    where: {
      key: "chatBotType",
      companyId
    }
  });


  const botList = async () => {
    const sectionsRows = [];

    queues.forEach((queue, index) => {
      sectionsRows.push({
        title: queue.name,
        rowId: `${index + 1}`
      });
    });

    const sections = [
      {
        rows: sectionsRows
      }
    ];

    const listMessage = {
      text: formatBody(`\u200e${greetingMessage}`, contact),
      buttonText: "Escolha uma opção",
      sections
    };

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      listMessage
    );

    await verifyMessage(sendMsg, ticket, ticket.contact);
  }

  const botButton = async () => {
    const buttons = [];
    queues.forEach((queue, index) => {
      buttons.push({
        buttonId: `${index + 1}`,
        buttonText: { displayText: queue.name },
        type: 4
      });
    });

    const buttonMessage = {
      text: formatBody(`\u200e${greetingMessage}`, contact),
      buttons,
      headerType: 4
    };

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      buttonMessage
    );

    await verifyMessage(sendMsg, ticket, ticket.contact);
  }

  const botText = async () => {
    let options = "";

    queues.forEach((queue, index) => {
      options += `*[ ${index + 1} ]* - ${queue.name}\n`;
    });


    const textMessage = {
      text: formatBody(`\u200e${greetingMessage}\n\n${options}`, contact),
    };

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      textMessage
    );

    await verifyMessage(sendMsg, ticket, ticket.contact);
  };

  if (choosenQueue) {

    let chatbot = false;
    if (choosenQueue?.options) {
      chatbot = choosenQueue.options.length > 0;
    }
    await UpdateTicketService({
      ticketData: { queueId: choosenQueue.id, chatbot },
      ticketId: ticket.id,
      companyId: ticket.companyId,
    });


    /* Tratamento para envio de mensagem quando a fila está fora do expediente */
    if (choosenQueue.options.length === 0) {
      const queue = await Queue.findByPk(choosenQueue.id);
      const { schedules }: any = queue;
      const now = moment();
      const weekday = now.format("dddd").toLowerCase();
      let schedule;
      if (Array.isArray(schedules) && schedules.length > 0) {
        schedule = schedules.find((s) => s.weekdayEn === weekday && s.startTime !== "" && s.startTime !== null && s.endTime !== "" && s.endTime !== null);
      }

      if (queue.outOfHoursMessage !== null && queue.outOfHoursMessage !== "" && !isNil(schedule)) {
        const startTime = moment(schedule.startTime, "HH:mm");
        const endTime = moment(schedule.endTime, "HH:mm");

        if (now.isBefore(startTime) || now.isAfter(endTime)) {
          const body = formatBody(`${queue.outOfHoursMessage}\n\n*[ # ]* - Voltar ao Menu Principal`, ticket.contact);
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            text: body,
          }
          );
          await verifyMessage(sentMessage, ticket, contact);


          const outsidemessageActive = await Setting.findOne({
        where: {
          key: "outsidemessage",
          companyId
        }
        });

          logger.info(outsidemessageActive.value);

          if(outsidemessageActive.value === "disabled") {

            logger.info("MENSAGEM ENVIADA FORA DO HORÁRIO - SEM ABRIR TICKET");

              await UpdateTicketService({
                ticketData: { queueId: null, chatbot },
                ticketId: ticket.id,
                companyId: ticket.companyId,
              });

              return;

           }

        }
      }

      const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket.contact
      );
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
        text: body,
      }
      );
      await verifyMessage(sentMessage, ticket, contact);
    }

  } else {
    if (buttonActive.value === "list") {
      return botList();
    };

    if (buttonActive.value === "button" && queues.length <= 4) {
      return botButton();
    }

    if (buttonActive.value === "text") {
      return botText();
    }

    if (buttonActive.value === "button" && queues.length > 4) {
      return botText();
    }

  }

};


const verifyRating = (ticketTraking: TicketTraking) => {
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt !== null
  ) {
    return true;
  }
  return false;
};

const handleRating = async (
  msg: WAMessage,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  let rate: any | null = null;

  if (msg.message?.conversation) {
    rate = +msg.message?.conversation;
  }

  if (!isNull(rate) && ticketTraking.ratingId) {
    const { complationMessage } = await ShowWhatsAppService(
      ticket.whatsappId,
      ticket.companyId
    );

    const optionRating = rate;
    const rating = await Rating.findByPk(ticketTraking.ratingId, {
      include: [
        {
          model: RatingOption,
          as: "options",
        }
      ]
    });
    if (rating) {
      const ratingOptionsSelected = rating.options.filter(
        option => `${option.value}` === `${optionRating}`
      );

      let sendFarewellWaitingTicket = await Setting.findOne({
        where: {
          key: "sendFarewellWaitingTicket",
          companyId: ticket.companyId
        }
      });

      if (ratingOptionsSelected.length > 0) {
        await UserRating.create({
          ticketId: ticketTraking.ticketId,
          companyId: ticketTraking.companyId,
          userId: ticketTraking.userId,
          ratingId: ticketTraking.ratingId,
          ratingIdOption: ratingOptionsSelected[0].id
        });

        if (!isNil(complationMessage) && complationMessage !== "") {
          if ((ticket.status !== 'pending') || (ticket.status === 'pending' && sendFarewellWaitingTicket?.value === 'enabled')) {
            const body = `\u200e${complationMessage}`;
            await SendWhatsAppMessage({ body, ticket });
          }
        }

        await ticketTraking.update({
          finishedAt: moment().toDate(),
          rated: true
        });

        await ticket.update({
          queueId: null,
          userId: null,
          status: "closed"
        });

        io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });

        io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
          });

        //COMENTARIO
        //console.log("linha 1162 - wbot");


      } else {

        if (!isNil(complationMessage) && complationMessage !== "") {
          if ((ticket.status !== 'pending') || (ticket.status === 'pending' && sendFarewellWaitingTicket?.value === 'enabled')) {
            const body = `\u200e${complationMessage}`;
            await SendWhatsAppMessage({ body, ticket });
          }
        }

        await ticketTraking.update({
          finishedAt: moment().toDate(),
          rated: true
        });

        await ticket.update({
          queueId: null,
          userId: null,
          status: "closed"
        });

        io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });

        io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
          });

        //COMENTARIO
        //console.log("linha 1200 - wbot");

      }
    }
  }
};

/*
 *
const handleRating = async (
  msg: WAMessage,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  let rate: number | null = null;

  if (msg.message?.conversation) {
    rate = +msg.message?.conversation;
  }

  if (!Number.isNaN(rate) && Number.isInteger(rate) && !isNull(rate)) {
    const { complationMessage } = await ShowWhatsAppService(
      ticket.whatsappId,
      ticket.companyId
    );

    let finalRate = rate;

    if (rate < 1) {
      finalRate = 1;
    }
    if (rate > 3) {
      finalRate = 3;
    }

    await UserRating.create({
      ticketId: ticketTraking.ticketId,
      companyId: ticketTraking.companyId,
      userId: ticketTraking.userId,
      rate: finalRate,
    });
    const body = formatBody(`\u200e${complationMessage}`, ticket.contact);
    await SendWhatsAppMessage({ body, ticket });

    await ticketTraking.update({
      finishedAt: moment().toDate(),
      rated: true,
    });

    await ticket.update({
      queueId: null,
      userId: null,
      status: "closed",
    });

    io.to("open").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id,
    });

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id,
      });

  }

};

*/

const handleChartbot = async (
  ticket: Ticket,
  msg: WAMessage,
  wbot: Session,
  dontReadTheFirstQuestion: boolean = false
) => {
  const queue = await Queue.findByPk(ticket.queueId, {
    include: [
      {
        model: QueueOption,
        as: "options",
        where: { parentId: null },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"]
        ]
      }
    ]
  });

  const messageBody = getBodyMessage(msg);

  if (messageBody == "#") {
    // voltar para o menu inicial
    await ticket.update({ queueOptionId: null, chatbot: false, queueId: null });
    await verifyQueue(wbot, msg, ticket, ticket.contact);
    return;
  }

  const companyId = ticket.companyId;

  const buttonActive = await Setting.findOne({
    where: {
      key: "chatBotType",
      companyId
    }
  });

  const botText = async () => {

    console.log("BOT TEXTO");

    if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "#") {
      // falar com atendente
      await ticket.update({ queueOptionId: null, chatbot: false });
      const sentMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: "\u200eAguarde, você será atendido em instantes."
        }
      );

      verifyMessage(sentMessage, ticket, ticket.contact);
      return;
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "0") {
      // voltar para o menu anterior
      const option = await QueueOption.findByPk(ticket.queueOptionId);
      await ticket.update({ queueOptionId: option?.parentId });
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
      // escolheu uma opção
      const count = await QueueOption.count({
        where: { parentId: ticket.queueOptionId }
      });
      let option: any = {};
      if (count == 1) {
        option = await QueueOption.findOne({
          where: { parentId: ticket.queueOptionId }
        });
      } else {
        option = await QueueOption.findOne({
          where: {
            option: messageBody || "",
            parentId: ticket.queueOptionId
          }
        });
      }
      if (option) {
        await ticket.update({ queueOptionId: option?.id });
      }
    } else if (!isNil(queue) && isNil(ticket.queueOptionId) && !dontReadTheFirstQuestion ) {
      // não linha a primeira pergunta
      const option = queue?.options.find(o => o.option == messageBody);
      if (option) {
        await ticket.update({ queueOptionId: option?.id });
      }
    }

    await ticket.reload();

    if (!isNil(queue) && isNil(ticket.queueOptionId)) {
      let body = "";
      let options = "";
      const queueOptions = await QueueOption.findAll({
        where: { queueId: ticket.queueId, parentId: null },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"]
        ]
      });

      if (queue.greetingMessage) {
        body = `${queue.greetingMessage}\n\n`;
      }

      queueOptions.forEach((option, i) => {
        if (queueOptions.length - 1 > i) {
          options += `*[ ${option.option} ]* - ${option.title}\n`;
        } else {
          options += `*[ ${option.option} ]* - ${option.title}`;
        }
      });

      if (options !== "") {
        body += options;
      }

      body += "\n\n*[ # ]* - *Menu Inicial*";

      const textMessage = {
        text: formatBody(`\u200e${body}`, ticket.contact),
      };
      const sendMsg = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,textMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);

      if (queue.isChatbot) {

        await ticket.update({
          queueId: null
        })
      }
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
      const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
      const queueOptions = await QueueOption.findAll({
        where: { parentId: ticket.queueOptionId },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"]
        ]
      });
      let body = "";
      let options = "";
      let initialMessage = "";
      let aditionalOptions = "\n";
      if (queueOptions.length == 0) {
        const textMessage = {
          text: formatBody(`${currentOption.message}`, ticket.contact),
        };

        console.log(currentOption.queueType + "     ENTROU AQUIIIIIIIIIIIIIIII    "+ currentOption.parentId +"     11111111111111  " + currentOption.queueOptionsId)


        const lastMessageFromMe = await Message.findOne({
          where: {
            ticketId: ticket.id,
            fromMe: true,
            body: textMessage.text
          },
          order: [["createdAt", "DESC"]]
        });

        if (lastMessageFromMe) {
          if (currentOption.queueType === "queue" ) {
            // console.log("queueId:" + currentOption.queueOptionsId)
             await ticket.update({
               queueId: currentOption.queueOptionsId,
               queueOptionId: currentOption.parentId,
               chatbot: false
             })
           };

           if (currentOption.queueType === "attendent") {
             await ticket.update({
               userId: currentOption.queueUsersId,
               queueId: currentOption.queueOptionsId,
               queueOptionId: currentOption.parentId,
               chatbot: false
             })
           };

          return;
        }

        if (currentOption.queueType === "queue" ) {
          // console.log("queueId:" + currentOption.queueOptionsId)
           await ticket.update({
             queueId: currentOption.queueOptionsId,
             queueOptionId: currentOption.parentId,
             chatbot: false
           })
         };

         if (currentOption.queueType === "attendent") {
           await ticket.update({
            userId: currentOption.queueUsersId,
            queueId: currentOption.queueOptionsId,
            queueOptionId: currentOption.parentId,
            chatbot: false
           })
         };

        const sendMsg = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          textMessage
        );

        await verifyMessage(sendMsg, ticket, ticket.contact);


        return
      }
      if (queueOptions.length > 1) {
        if (!isNil(currentOption?.message) && currentOption?.message !== "") {
          initialMessage = `${currentOption?.message}\n\n`;
          body += initialMessage;
        }

        if (queueOptions.length == 0) {
          aditionalOptions = `*#* - *Falar com o atendente*\n`;
        }

        queueOptions.forEach(option => {
          options += `*[ ${option.option} ]* - ${option.title}\n`;
        });

        if (options !== "") {
          body += options;
        }

        aditionalOptions += "*[ 0 ]* - *Voltar*\n";
        aditionalOptions += "*[ # ]* - *Menu inicial*";

        body += aditionalOptions;
      } else {
        const firstOption = head(queueOptions);
        if (firstOption) {
          body = `${firstOption?.title}`;
          if (firstOption?.message) {
            body += `\n\n${firstOption.message}`;
          }
        } else {

          body += `*[ 0 ]* - *Voltar*\n`;
          body += `*[ # ]* - *Menu inicial*`;
        }
      }

      const textMessage = {
        text: formatBody(`\u200e${body}`, ticket.contact),
      };

      const sendMsg = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        textMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);
    }

  };

  const botList = async () => {
    if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "#") {
      // falar com atendente
      await ticket.update({ queueOptionId: null, chatbot: false });
      const sentMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: "\u200eAguarde, você será atendido em instantes."
        }
      );

      verifyMessage(sentMessage, ticket, ticket.contact);
      return;
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "0") {
      // voltar para o menu anterior
      const option = await QueueOption.findByPk(ticket.queueOptionId);
      await ticket.update({ queueOptionId: option?.parentId });
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
      // escolheu uma opção
      const count = await QueueOption.count({
        where: { parentId: ticket.queueOptionId }
      });
      let option: any = {};
      if (count == 1) {
        option = await QueueOption.findOne({
          where: { parentId: ticket.queueOptionId }
        });
      } else {
        option = await QueueOption.findOne({
          where: {
            option: messageBody || "",
            parentId: ticket.queueOptionId
          }
        });
      }
      if (option) {
        await ticket.update({ queueOptionId: option?.id });
      }
    } else if (!isNil(queue) && isNil(ticket.queueOptionId) && !dontReadTheFirstQuestion ) {
      // não linha a primeira pergunta
      const option = queue?.options.find(o => o.option == messageBody);
      if (option) {
        await ticket.update({ queueOptionId: option?.id });
      }
    }

    await ticket.reload();

    if (!isNil(queue) && isNil(ticket.queueOptionId)) {
      const sectionsRows = [];
      let body = "";
      let options = "";
      const queueOptions = await QueueOption.findAll({
        where: { queueId: ticket.queueId, parentId: null },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"]
        ]
      });

      if (queue.greetingMessage) {
        body = `${queue.greetingMessage}\n\n`;
      }

      queueOptions.forEach((option, i) => {
        sectionsRows.push({
          title: option.title,
          rowId: `${option.option}`
        });
      });

      sectionsRows.push({
        title: "Voltar Menu Inicial",
        rowId: `#`
      });

      const sections = [
        {
          rows: sectionsRows
        }
      ];

      const listMessage = {
        text: formatBody(`\u200e${queue.greetingMessage}`, ticket.contact),
        buttonText: "Escolha uma opção",
        sections
      };

      const sendMsg = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        listMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);
      if (queue.isChatbot) {
        await ticket.update({
          queueId: null
      })
    }
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
      const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
      const queueOptions = await QueueOption.findAll({
        where: { parentId: ticket.queueOptionId },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"]
        ]
      });
      let sectionsRows = [];
      let body = "";
      let initialMessage = "";

      if (queueOptions.length > 1) {
        if (!isNil(currentOption?.message) && currentOption?.message !== "") {
          initialMessage = `${currentOption?.message}`;
          body += initialMessage;
        }

        if (queueOptions.length == 0) {
          sectionsRows.push({
            title: "Voltar Menu Inicial",
            rowId: `#`
          });
        }

        queueOptions.forEach(option => {
          sectionsRows.push({
            title: option.title,
            rowId: `${option.option}`
          });
        });

        /* if (options !== "") {
          body += options;
        } */

        sectionsRows.push({
          title: "Voltar",
          rowId: `0`
        });
        sectionsRows.push({
          title: "Menu Inicial",
          rowId: `#`
        });


        //body += aditionalOptions;
      } else {
        const firstOption = head(queueOptions);
        if (firstOption) {
          body = `${firstOption?.title}`;
          if (firstOption?.message) {
            body += `\n\n${firstOption.message}`;
          }
          sectionsRows.push({
            title: "Voltar",
            rowId: `0`
          });
          sectionsRows.push({
            title: "Menu Inicial",
            rowId: `#`
          });
        } else {
          sectionsRows.push({
            title: "Voltar",
            rowId: `0`
          });
          sectionsRows.push({
            title: "Menu Inicial",
            rowId: `#`
          });
        }
      }
      const sections = [
        {
          rows: sectionsRows
        }
      ];
      const listMessage = {
        text: formatBody(`\u200e${body}`, ticket.contact),
        buttonText: "Escolha uma opção",
        sections
      };

      const sendMsg = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        listMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);
      if (queue.isChatbot) {
        await ticket.update({
          queueId: null
      })
    }
    }
  };

  const botButton = async () => {
    if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "#") {
      // falar com atendente
      await ticket.update({ queueOptionId: null, chatbot: false });
      const sentMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: "\u200eAguarde, você será atendido em instantes."
        }
      );

      verifyMessage(sentMessage, ticket, ticket.contact);
      return;
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "0") {
      // voltar para o menu anterior
      const option = await QueueOption.findByPk(ticket.queueOptionId);
      await ticket.update({ queueOptionId: option?.parentId });
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
      // escolheu uma opção
      const count = await QueueOption.count({
        where: { parentId: ticket.queueOptionId }
      });
      let option: any = {};
      if (count == 1) {
        option = await QueueOption.findOne({
          where: { parentId: ticket.queueOptionId }
        });
      } else {
        option = await QueueOption.findOne({
          where: {
            option: messageBody || "",
            parentId: ticket.queueOptionId
          }
        });
      }
      if (option) {
        await ticket.update({ queueOptionId: option?.id });
      }
    } else if (!isNil(queue) && isNil(ticket.queueOptionId) && !dontReadTheFirstQuestion ) {
      // não linha a primeira pergunta
      const option = queue?.options.find(o => o.option == messageBody);
      if (option) {
        await ticket.update({ queueOptionId: option?.id });
      }
    }

    await ticket.reload();

    if (!isNil(queue) && isNil(ticket.queueOptionId)) {
      const buttons = [];
      let body = "";
      let options = "";
      const queueOptions = await QueueOption.findAll({
        where: { queueId: ticket.queueId, parentId: null },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"]
        ]
      });

      if (queue.greetingMessage) {
        body = `${queue.greetingMessage}\n\n`;
      }

      queueOptions.forEach((option, i) => {
        buttons.push({
          buttonId: `${option.option}`,
          buttonText: { displayText: option.title },
          type: 4
        });
      });

      buttons.push({
        buttonId: `#`,
        buttonText: { displayText: "Voltar Menu Inicial" },
        type: 4
      });

      const buttonMessage = {
        text: formatBody(`\u200e${queue.greetingMessage}`, ticket.contact),
        buttons,
        headerType: 4
      };

      const sendMsg = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        buttonMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);
    } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
      const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
      const queueOptions = await QueueOption.findAll({
        where: { parentId: ticket.queueOptionId },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"]
        ]
      });
      const buttons = [];
      let sectionsRows = [];
      let body = "";
      let initialMessage = "";

      if (queueOptions.length > 1) {
        if (!isNil(currentOption?.message) && currentOption?.message !== "") {
          initialMessage = `${currentOption?.message}`;
          body += initialMessage;
        }

        if (queueOptions.length == 0) {
          buttons.push({
            buttonId: `#`,
            buttonText: { displayText: "Voltar Menu Inicial" },
            type: 4
          });
        }

        queueOptions.forEach(option => {
          buttons.push({
            buttonId: `${option.option}`,
            buttonText: { displayText: option.title },
            type: 4
          });
        });

        /* if (options !== "") {
          body += options;
        } */

        buttons.push({
          buttonId: `0`,
          buttonText: { displayText: "Voltar" },
          type: 4
        });
        buttons.push({
          buttonId: `#`,
          buttonText: { displayText: "Voltar Menu Inicial" },
          type: 4
        });


        //body += aditionalOptions;
      } else {
        const firstOption = head(queueOptions);
        if (firstOption) {
          body = `${firstOption?.title}`;
          if (firstOption?.message) {
            body += `\n\n${firstOption.message}`;
          }
          buttons.push({
            buttonId: `0`,
            buttonText: { displayText: "Voltar" },
            type: 4
          });
          buttons.push({
            buttonId: `#`,
            buttonText: { displayText: "Voltar Menu Inicial" },
            type: 4
          });
        } else {
          buttons.push({
            buttonId: `0`,
            buttonText: { displayText: "Voltar" },
            type: 4
          });
          buttons.push({
            buttonId: `#`,
            buttonText: { displayText: "Voltar Menu Inicial" },
            type: 4
          });
        }
      }
      const sections = [
        {
          rows: sectionsRows
        }
      ];
      const buttonMessage = {
        text: formatBody(`\u200e${body}`, ticket.contact),
        buttons,
        headerType: 4
      };

      const sendMsg = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        buttonMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);
    }
  };


  if (buttonActive.value === "list") {
    return botList();
  };

  if (buttonActive.value === "button" && QueueOption.length <= 4) {
    return botButton();
  }

  if (buttonActive.value === "text") {
    return botText();
  }

  if (buttonActive.value === "button" && QueueOption.length > 4) {
    return botText();
  }

  if (!isNil(queue) && isNil(ticket.queueOptionId)) {
    let body = "";
    let options = "";

    const queueOptions = await QueueOption.findAll({
      where: { queueId: ticket.queueId, parentId: null },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"]
      ]
    });

    if (queue.greetingMessage) {
      body = `${queue.greetingMessage}\n\n`;
    }

    queueOptions.forEach((option, i) => {
      if (queueOptions.length - 1 > i) {
        options += `*${option.option}* - ${option.title}\n`;
      } else {
        options += `*${option.option}* - ${option.title}`;
      }
    });

    if (options !== "") {
      body += options;
    }

    body += "\n\n*#* - *Menu inicial*";

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${
            ticket.isGroup ? "g.us" : "s.whatsapp.net"
          }`,
          {
            text: body
          }
        );
        verifyMessage(sentMessage, ticket, ticket.contact);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
    const queueOptions = await QueueOption.findAll({
      where: { parentId: ticket.queueOptionId },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"]
      ]
    });
    let body = "";
    let options = "";
    let initialMessage = "";
    let aditionalOptions = "\n";
    if (queueOptions.length == 0) {
      const textMessage = {
        text: formatBody(`${currentOption.message}`, ticket.contact),
      };

       console.log(currentOption.queueType + "     ENTROU AQUIIIIIIIIIIIIIIII    "+ currentOption.parentId +"     11111111111111  " + currentOption.queueOptionsId)


      const lastMessageFromMe = await Message.findOne({
        where: {
          ticketId: ticket.id,
          fromMe: true,
          body: textMessage.text
        },
        order: [["createdAt", "DESC"]]
      });

      if (lastMessageFromMe) {
        if (currentOption.queueType === "queue" ) {
          // console.log("queueId:" + currentOption.queueOptionsId)
           await ticket.update({
             queueId: currentOption.queueOptionsId,
             queueOptionId: currentOption.parentId,
             chatbot: false
           })
         };

         if (currentOption.queueType === "attendent") {
           await ticket.update({
             userId: currentOption.queueUsersId,
             queueId: currentOption.queueOptionsId,
             queueOptionId: currentOption.parentId,
             chatbot: false
           })
         };

        return;
      }

      if (currentOption.queueType === "queue" ) {
        // console.log("queueId:" + currentOption.queueOptionsId)
         await ticket.update({
           queueId: currentOption.queueOptionsId,
           queueOptionId: currentOption.parentId,
           chatbot: false
         })
       };

       if (currentOption.queueType === "attendent") {
         await ticket.update({
           userId: currentOption.queueUsersId,
           queueId: currentOption.queueOptionsId,
           queueOptionId: currentOption.parentId,
           chatbot: false
         })
       };

      const sendMsg = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        textMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);


      return
    }

    if (queueOptions.length > 1) {
      if (!isNil(currentOption?.message) && currentOption?.message !== "") {
        initialMessage = `${currentOption?.message}\n\n`;
        body += initialMessage;
      }

      if (queueOptions.length == 0) {
        aditionalOptions = `*#* - *Falar com o atendente*\n`;
      }

      queueOptions.forEach(option => {
        options += `*${option.option}* - ${option.title}\n`;
      });

      if (options !== "") {
        body += options;
      }

      aditionalOptions += "*0* - *Voltar*\n";
      aditionalOptions += "*#* - *Menu inicial*";

      body += aditionalOptions;
    } else {
      const firstOption = head(queueOptions);
      if (firstOption) {
        body = `${firstOption?.title}`;
        if (firstOption?.message) {
          body += `\n\n${firstOption.message}`;
        }
      } else {
        body = `*#* - *Falar com o atendente*\n\n`;
        body += `*0* - *Voltar*\n`;
        body += `*#* - *Menu inicial*`;
      }
    }

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${
            ticket.isGroup ? "g.us" : "s.whatsapp.net"
          }`,
          {
            text: body
          }
        );
        verifyMessage(sentMessage, ticket, ticket.contact);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();
  }
};

const getChat = async (whatsapp: Whatsapp, msg: proto.IWebMessageInfo) => {
  try {
    const countMessageUnread = await ShowBaileysChatService(
      whatsapp.id!,
      msg.key.remoteJid
    );

    return countMessageUnread.unreadCount;
  } catch (error) {
    return 0;
  }
};

const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number
): Promise<void> => {

  if (!isValidMsg(msg)) return;
  try {
    let msgContact: IMe;
    let groupContact: Contact | undefined;

    const isGroup = msg.key.remoteJid?.endsWith("@g.us");

    const msgIsGroupBlock = await Setting.findOne({
      where: {
        companyId,
        key: "CheckMsgIsGroup",
      },
    });

    const bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);

    const hasMedia =
      msg.message?.audioMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
      msg.message.stickerMessage ||
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
      msg.message?.viewOnceMessageV2?.message?.imageMessage

    if (msg.key.fromMe) {
      if (/\u200e/.test(bodyMessage)) return;

      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "vcard" &&
        msgType !== "reactionMessage" &&
        msgType !== "ephemeralMessage" &&
        msgType !== "protocolMessage" &&
        msgType !== "viewOnceMessage"
      )
        return;
      msgContact = await getContactMessage(msg, wbot);
    } else {
      msgContact = await getContactMessage(msg, wbot);
    }

    if (msgIsGroupBlock?.value === "enabled" && isGroup) return;

    if (isGroup) {
      const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid);
      const msgGroupContact = {
        id: grupoMeta.id,
        name: grupoMeta.subject
      };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }

    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);
    const countMessageUnread = await getChat(whatsapp, msg);
    const unreadMessages = msg.key.fromMe ? 0 : countMessageUnread;
    const contact = await verifyContact(msgContact, wbot, companyId);

    if (unreadMessages === 0 && whatsapp.farewellMessage && formatBody(whatsapp.farewellMessage, contact) === bodyMessage)
      return;

    const ticket = await FindOrCreateTicketService(contact, whatsapp.id!, unreadMessages, companyId, groupContact,);

    //console.log(ticket);
          /*

    let ticket: Ticket;
    let findticket = await Ticket.findOne({
      where: {
        status: {
          [Op.or]: ["open", "pending"]
        },
        contactId: groupContact ? groupContact.id : contact.id
      }
    });

    ticket = await FindOrCreateTicketService(contact, whatsapp.id!, unreadMessages, companyId, groupContact,);

    console.log(findticket.id);

    if (!findticket && msg.key.fromMe) {

      logger.info("Nenhum ticket localizado...");

      if(outsidemessageActive.value === "disabled") {
        logger.info("MENSAGEM ENVIADA POR FORA DA APLICAÇÃO WEB WPW");
        return;

      }else{

        logger.info("Abrindo ticket 1...");
        ticket = await FindOrCreateTicketService(contact, whatsapp.id!, unreadMessages, companyId, groupContact,);
      }

    } else {
      logger.info("Abrindo ticket 2...");
      ticket = await FindOrCreateTicketService(contact, whatsapp.id!, unreadMessages, companyId, groupContact,);
    }

    */


    let findIgnore = await Whatsapp.findOne({
      where: {
        id: wbot.id
      }
    });
    if (findIgnore.ignoreNumbers) {
    logger.info("Lista de Números a Ignorar Encontrada");
      logger.info(findIgnore.ignoreNumbers);
      const ignoreNumbers = findIgnore.ignoreNumbers.toString();
      const ignoreArray = ignoreNumbers.split(",");
      if (ignoreArray.includes(ticket.contact.number)) {
        logger.info("Número Encontrado - SAINDO...");
        logger.info(ticket.contact.number);

            return;

      }
  }

    // INTEGRAÇÃO EXTERNA - WEBHOOK DE MENSAGENS RECEBIDAS - TRATAMENTO
    const filaescolhida = ticket.queue?.name
    const filaescolhidaid = ticket.queue?.id
    const disparaporonde = wbot.id;

    //let whatsapp: Whatsapp;
    let findwebhook = await Whatsapp.findOne({
      where: {
        id: wbot.id
      }
    });



    if(findwebhook.webhook ){

      logger.info("WEBHOOK ENCONTRADO");
      logger.info(findwebhook.webhook);

      const webhookurl = findwebhook.webhook;
      if(webhookurl){

          if (bodyMessage !== "SAIR") {

            var postwebhook = {
                          method: 'POST',
                          url: webhookurl,
                          data: {
                            filaescolhida: filaescolhida,
                            filaescolhidaid: filaescolhidaid,
                            mensagem: getBodyMessage(msg),
                            sender: ticket.contact.number,
                            chamadoId: ticket.id,
                            acao: 'start',
                            name: msgContact?.name,
                            companyId: companyId,
                            defaultWhatsapp_x: wbot.id
                          }
                        };
            axios.request(postwebhook);
            logger.info("WEBHOOK POST EXEC");

            }

        }
    }





    // voltar para o menu inicial
    if (bodyMessage === "SAIR") {

      const sentMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: "*Você encerrou este atendimento usando o comando SAIR*.\n\n\nSe você finalizou o atendimento *ANTES* de receber um retorno do operador, ele *NÃO* irá visualizar sua solicitação!\n\nVocê deve aguardar o retorno do operador e que ele encerre seu atendimento quando necessário.\n\nUse a opção *SAIR* somente em casos de emergência ou se ficou preso em algum setor.\n\n\nPara iniciar um novo atendimento basta enviar uma nova mensagem!"
        }
      );

      verifyMessage(sentMessage, ticket, ticket.contact);

      if(findwebhook.webhook){

      logger.info("WEBHOOK ENCONTRADO");
      logger.info(findwebhook.webhook);

      const webhookurl = findwebhook.webhook;

      if(webhookurl){

          var postwebhook = {
                          method: 'POST',
                          url: webhookurl,
                          data: {
                            filaescolhida: filaescolhida,
                            filaescolhidaid: filaescolhidaid,
                            mensagem: getBodyMessage(msg),
                            sender: ticket.contact.number,
                            chamadoId: ticket.id,
                            acao: 'end',
                            name: msgContact?.name,
                            companyId: companyId,
                            defaultWhatsapp_x: wbot.id
                          }
                        };

          axios.request(postwebhook);

          logger.info("WEBHOOK POST EXEC ENCERRAMENTO #");

         }

      }


      await UpdateTicketService({
        ticketData: { queueId: null, status: "closed" },
        ticketId: ticket.id,
        companyId: ticket.companyId,
      });


    await ticket.reload();
      return;
    }

    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp?.id,
    });


    if (hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    try {
      if (!msg.key.fromMe) {
        /*** Tratamento para avaliação do atendente */
        if (ticketTraking !== null && verifyRating(ticketTraking)) {
          handleRating(msg, ticket, ticketTraking);
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    if (!ticket.queue && !isGroup && !msg.key.fromMe && !ticket.userId && whatsapp.queues.length >= 1) {
      await verifyQueue(wbot, msg, ticket, ticket.contact);
    }
    const dontReadTheFirstQuestion = ticket.queue === null;

    // Verificação se aceita audio do contato
    if (
      getTypeMessage(msg) === "audioMessage" &&
      !msg.key.fromMe &&
      !isGroup &&
      !contact.acceptAudioMessage
    ) {
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@c.us`,
        {
          text: "*Assistente Virtual*:\nInfelizmente não é possível enviar ou escutar áudios por este canal de atendimento. Envie uma mensagem de *texto*."
        },
        {
          quoted: {
            key: msg.key,
            message: {
              extendedTextMessage: msg.message.extendedTextMessage
            }
          }
        }
      );
      await verifyMessage(sentMessage, ticket, contact);
    }

    await ticket.reload();

    if (whatsapp.queues.length == 1 && ticket.queue) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot);
      }
    }
    if (whatsapp.queues.length > 1 && ticket.queue) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot, dontReadTheFirstQuestion);
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise((r) => setTimeout(r, 500));
  const io = getIO();

  try {
    const messageToUpdate = await Message.findByPk(msg.key.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"],
        },
      ],
    });

    if (!messageToUpdate) return;
    await messageToUpdate.update({ ack: chat });
    io.of(messageToUpdate.companyId.toString()).emit(
      `company-${messageToUpdate.companyId}-appMessage`,
      {
        action: "update",
        message: messageToUpdate,
      }
    );

    //COMENTARIO
    //console.log("linha 2469 - wbot");

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};

const verifyRecentCampaign = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  if (!message.key.fromMe) {
    const number = message.key.remoteJid.replace(/\D/g, "");
    const campaigns = await Campaign.findAll({
      where: { companyId, status: "EM_ANDAMENTO", confirmation: true },
    });
    if (campaigns) {
      const ids = campaigns.map((c) => c.id);
      const campaignShipping = await CampaignShipping.findOne({
        where: { campaignId: { [Op.in]: ids }, number, confirmation: null },
      });

      if (campaignShipping) {
        await campaignShipping.update({
          confirmedAt: moment(),
          confirmation: true,
        });
        await campaignQueue.add(
          "DispatchCampaign",
          {
            campaignShippingId: campaignShipping.id,
            campaignId: campaignShipping.campaignId,
          },
          {
            delay: parseToMilliseconds(randomValue(0, 10)),
          }
        );
      }
    }
  }
};

const verifyCampaignMessageAndCloseTicket = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  const io = getIO();
  const body = getBodyMessage(message);
  const isCampaign = /\u200c/.test(body);
  if (message.key.fromMe && isCampaign) {
    const messageRecord = await Message.findOne({
      where: { id: message.key.id!, companyId },
    });
    const ticket = await Ticket.findByPk(messageRecord.ticketId);
    await ticket.update({ status: "closed" });

    io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id,
    });

    io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id,
      });
  }
};

const filterMessages = (msg: WAMessage): boolean => {
  if (msg.message?.protocolMessage) return false;

  if (
    [
      WAMessageStubType.REVOKE,
      WAMessageStubType.E2E_DEVICE_CHANGED,
      WAMessageStubType.E2E_IDENTITY_CHANGED,
      WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType as WAMessageStubType)
  )
    return false;

  return true;
};

const wbotMessageListener = async (wbot: Session, companyId: number): Promise<void> => {
  try {
    wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {
      const messages = messageUpsert.messages
        .filter(filterMessages)
        .map(msg => msg);

      if (!messages) return;

      messages.forEach(async (message: proto.IWebMessageInfo) => {
        const messageExists = await Message.count({
          where: { id: message.key.id!, companyId }
        });

        if (!messageExists) {
          await handleMessage(message, wbot, companyId);
          await verifyRecentCampaign(message, companyId);
          await verifyCampaignMessageAndCloseTicket(message, companyId);
        }
      });
    });

    wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
      if (messageUpdate.length === 0) return;
      messageUpdate.forEach(async (message: WAMessageUpdate) => {
        (wbot as WASocket)!.readMessages([message.key])

        handleMsgAck(message, message.update.status);
      });
    });

    wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
      if (messageUpdate.length === 0) return;
      messageUpdate.forEach(async (message: WAMessageUpdate) => {
        handleMsgAck(message, message.update.status);
      });
    });

    wbot.ev.on("chats.update", async (chatUpdate: Partial<Chat>[]) => {
      if (chatUpdate.length === 0) return;

      chatUpdate.forEach(async (chat: Partial<Chat>) => {
        await CreateOrUpdateBaileysChatService(wbot.id, chat);
      });
    });
  } catch (error) {
    Sentry.captureException(error);
    logger.error(`Error handling wbot message listener. Err: ${error}`);
  }
};

export { wbotMessageListener, handleMessage };
