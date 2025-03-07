import * as Sentry from "@sentry/node";
import Queue from "bull";
import { MessageData, SendMessage } from "./helpers/SendMessage";
import Whatsapp from "./models/Whatsapp";
import { logger } from "./utils/logger";
import moment from "moment";
//import 'moment-timezone';
import { getIO } from "./libs/socket";
import Schedule from "./models/Schedule";
import Contact from "./models/Contact";
import Ticket from "./models/Ticket";
import Queues from "./models/Queue";
import UserQueue from "./models/UserQueue";
import Message from "./models/Message";
import { Op, QueryTypes } from "sequelize";
import GetDefaultWhatsApp from "./helpers/GetDefaultWhatsApp";
import Campaign from "./models/Campaign";
import ContactList from "./models/ContactList";
import ContactListItem from "./models/ContactListItem";
import { isEmpty, isNil, isArray } from "lodash";
import CampaignSetting from "./models/CampaignSetting";
import CampaignShipping from "./models/CampaignShipping";
import GetWhatsappWbot from "./helpers/GetWhatsappWbot";
import sequelize from "./database";
import SendWhatsAppMedia, { getMessageOptions } from "./services/WbotServices/SendWhatsAppMedia";
import { getWbot } from "./libs/wbot";
import path from "path";
import User from "./models/User";
import Company from "./models/Company";
import Setting from "./models/Setting";
import Plan from "./models/Plan";
import CreateOrUpdateContactService from "./services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "./services/TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "./services/TicketServices/UpdateTicketService";
import SendWhatsAppMessage from "./services/WbotServices/SendWhatsAppMessage";
import ShowTicketService from "./services/TicketServices/ShowTicketService";
import UpdateMessageServiceCronPending from "./services/MessageServices/UpdateMessageServiceCronPending";
const fs = require('fs');
const mime = require('mime-types');
const chardet = require('chardet');
import ShowContactService from "./services/ContactServices/ShowContactService";
import formatBody from "./helpers/Mustache";

import ShowWhatsAppService from "./services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "./services/WhatsappService/UpdateWhatsAppService";
import TicketTraking from "./models/TicketTraking";
import { job } from "cron";
import { verifyMessage } from "./services/WbotServices/wbotMessageListener";


const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;
const connection = process.env.REDIS_URI || "";
const limiterMax = process.env.REDIS_OPT_LIMITER_MAX || 1;
const limiterDuration = process.env.REDIS_OPT_LIMITER_DURATION || 3000;




var axios = require('axios');

interface ProcessCampaignData {
  id: number;
  delay: number;
}

interface CampaignSettings {
  messageInterval: number;
  longerIntervalAfter: number;
  greaterInterval: number;
  variables: any[];
}

interface PrepareContactData {
  contactId: number;
  campaignId: number;
  delay: number;
  variables: any[];
}

interface DispatchCampaignData {
  campaignId: number;
  campaignShippingId: number;
  contactListItemId: number;
}

export const userMonitor = new Queue("UserMonitor", connection);

export const messageQueue = new Queue("MessageQueue", connection, {
  limiter: {
    max: limiterMax as number,
    duration: limiterDuration as number
  }
});

export const scheduleMonitor = new Queue("ScheduleMonitor", connection);
export const sendScheduledMessages = new Queue(
  "SendSacheduledMessages",
  connection
);

export const schedulesRecorrenci = new Queue("schedulesRecorrenci", connection)

export const campaignQueue = new Queue("CampaignQueue", connection);

const sendScheduledMessagesWbot = new Queue(
  "SendWbotMessages",
  connection
);

async function handleSendMessage(job) {
  try {
    const { data } = job;

    const whatsapp = await Whatsapp.findByPk(data.whatsappId);

    if (whatsapp == null) {
      throw Error("Whatsapp não identificado");
    }

    const messageData: MessageData = data.data;

    await SendMessage(whatsapp, messageData);
  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("MessageQueue -> SendMessage: error", e.message);
    throw e;
  }
}

async function handleSendMessageWbot(job) {
  try {
    const { data } = job;

    if (!data.messageData) {
      return;
    }

    //console.log(data);

    const { wbotId, number, text, options } = data.messageData;


    //console.log(wbotId);

    const wbot = await getWbot(Number(wbotId));




    const sentMessage = await wbot.sendMessage(number, {
      text: text
    },
      {
        ...options
      }
    );

    //console.log(sentMessage);


  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("MessageQueueWbot -> SendMessage: error", e.message);
    throw e;
  }
}

async function handleVerifySchedulesRecorrenci(job) {
  try {
    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where: {
        status: "ENVIADA",
        repeatEvery: {
          [Op.not]: null,
        },
        selectDaysRecorrenci: {
          [Op.not]: '',
        },
      },
      include: [{ model: Contact, as: "contact" }]
    });
    if (count > 0) {
      schedules.map(async schedule => {
        if (schedule?.repeatCount === schedule?.repeatEvery) {

          await schedule.update({
            repeatEvery: null,
            selectDaysRecorrenci: null
          });

        } else {
          await schedule.update({
            sentAt: null
          });
        }

        if (schedule?.repeatCount === schedule?.repeatEvery) {
          await schedule.update({
            repeatEvery: null,
            selectDaysRecorrenci: null
          });
        } else {
          const newDateRecorrenci = await VerifyRecorrenciDate(schedule);
        }

      });
    }
  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("SendScheduledMessage -> Verify: error", e.message);
    throw e;
  }
}

async function VerifyRecorrenciDate(schedule) {
  const { sendAt, selectDaysRecorrenci } = schedule;
  const originalDate = moment(sendAt);

  let dateFound = false;
  const diasSelecionados = selectDaysRecorrenci.split(', '); // Dias selecionados

  let i = 1;
  while (!dateFound) {
    let nextDate = moment(originalDate).add(i, "days");
    nextDate = nextDate.set({
      hour: originalDate.hours(),
      minute: originalDate.minutes(),
      second: originalDate.seconds(),
    });

    // Verifica se o dia da semana da próxima data está na lista de dias selecionados
    if (diasSelecionados.includes(nextDate.format('dddd'))) {
      // A data está dentro do período
      // Faça algo aqui se necessário
      let update = schedule?.repeatCount;
      update = update + 1;

      await schedule.update({
        status: 'PENDENTE',
        sendAt: nextDate.format("YYYY-MM-DD HH:mm:ssZ"),
        repeatCount: update,
      });

      logger.info(`Recorrencia agendada para: ${schedule.contact.name}`);

      // Define a variável de controle para indicar que uma data foi encontrada
      dateFound = true;
    }
    i++;
  }
}

async function handleVerifySchedules(job) {
  try {
    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where: {
        status: "PENDENTE",
        sentAt: null,
        sendAt: {
          [Op.gte]: moment().format("YYYY-MM-DD HH:mm:ss"),
          [Op.lte]: moment().add("30", "seconds").format("YYYY-MM-DD HH:mm:ss")
        }
      },
      include: [{ model: Contact, as: "contact" }]
    });
    if (count > 0) {
      schedules.map(async schedule => {
        await schedule.update({
          status: "AGENDADA"
        });
        sendScheduledMessages.add(
          "SendMessage",
          { schedule },
          { delay: 40000 }
        );
        logger.info(`Disparo agendado para: ${schedule.contact.name}`);
      });
    }
  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("SendScheduledMessage -> Verify: error", e.message);
    throw e;
  }
}

async function handleSendScheduledMessage(job) {
  const {
    data: { schedule }
  } = job;
  let scheduleRecord: Schedule | null = null;

  try {
    scheduleRecord = await Schedule.findByPk(schedule.id);
  } catch (e) {
    Sentry.captureException(e);
    logger.info(`Erro ao tentar consultar agendamento: ${schedule.id}`);
  }

  try {

    const whatsapp = await Whatsapp.findByPk(schedule?.whatsappId);
    const queueId = schedule?.queueId

    if (schedule?.geral === true) {

      const ticket = await FindOrCreateTicketService(schedule.contact, schedule.whatsappId, 0, schedule.companyId, schedule.contact, true);

      if (queueId && queueId !== undefined || queueId !== null) {
        await ticket.update({
          queueId: queueId,
          whatsappId: schedule?.whatsappId,
          userId: schedule?.userId,
          isGroup: false,
          status: 'open'
        })
      }

      if (schedule?.mediaPath) {

        const url = `public/company${schedule.companyId}/${schedule.mediaPath}`

        const nomeDoArquivo = path.basename(url);
        const tipoMIME = mime.lookup(url);
        const buffer = fs.readFileSync(url);
        const encoding = chardet.detect(buffer);
        const estatisticasDoArquivo = fs.statSync(url);

        const media = {
          fieldname: 'file',
          originalname: schedule.mediaName,
          encoding: encoding,
          mimetype: tipoMIME,
          destination: url,
          filename: nomeDoArquivo,
          path: url,
          size: estatisticasDoArquivo.size,
          stream: fs.createReadStream(url),
          buffer: buffer,
        };

        const Request = {
          media: media,
          ticket: ticket,
          body: schedule.body,
        }

        await SendWhatsAppMedia(Request);

      }
      if (!schedule.mediaPath) {

        const wbot = await getWbot(whatsapp.id)
        const sentMessage = wbot.sendMessage(`${ticket?.contact?.number}@s.whatsapp.net`, {
          text: schedule?.body
        })
      }

    } else {

      if (schedule?.mediaPath) {
        const url = `public/company${schedule.companyId}/${schedule.mediaPath}`
        await SendMessage(whatsapp, {
          number: schedule.contact.number,
          body: schedule.body,
          mediaPath: url
        });
      }

      await SendMessage(whatsapp, {
        number: schedule.contact.number,
        body: schedule.body,
        companyId: schedule.companyId
      });
    }

    await scheduleRecord?.update({
      sentAt: moment().format("YYYY-MM-DD HH:mm"),
      status: "ENVIADA"
    });

    logger.info(`Mensagem agendada enviada para: ${schedule.contact.name}`);
    sendScheduledMessages.clean(15000, "completed");
  } catch (err: any) {
    Sentry.captureException(err);
    await scheduleRecord?.update({
      status: "ERRO"
    });
    logger.error("SendScheduledMessage -> SendMessage: error", err);
    throw err;
  }
}

async function handleVerifyCampaigns(job) {
  /**
   * @todo
   * Implementar filtro de campanhas
   */
  const campaigns: { id: number; scheduledAt: string }[] =
    await sequelize.query(
      `select id, "scheduledAt" from "Campaigns" c
    where "scheduledAt" between now() and now() + '1 hour'::interval and status = 'PROGRAMADA'`,
      { type: QueryTypes.SELECT }
    );
  logger.info(`Campanhas encontradas: ${campaigns.length}`);
  for (let campaign of campaigns) {
    try {
      const now = moment();
      const scheduledAt = moment(campaign.scheduledAt);
      const delay = scheduledAt.diff(now, "milliseconds");
      logger.info(
        `Campanha enviada para a fila de processamento: Campanha=${campaign.id}, Delay Inicial=${delay}`
      );
      campaignQueue.add(
        "ProcessCampaign",
        {
          id: campaign.id,
          delay
        },
        {
          priority: 3,
          removeOnComplete: { age: 60 * 60, count: 10 },
          removeOnFail: { age: 60 * 60, count: 10 }
        }
      );
    } catch (err: any) {
      Sentry.captureException(err);
    }
  }
}

async function getCampaign(id) {
  return await Campaign.findOne({
    where: { id },
    include: [
      {
        model: ContactList,
        as: "contactList",
        attributes: ["id", "name"],
        include: [
          {
            model: ContactListItem,
            as: "contacts",
            attributes: ["id", "name", "number", "email", "isWhatsappValid"],
            where: { isWhatsappValid: true }
          }
        ]
      },
      //{
      //  model: Whatsapp,
      //  as: "whatsapp",
      //  attributes: ["id", "name"]
      //},
      // {
      //   model: CampaignShipping,
      //   as: "shipping",
      //   include: [{ model: ContactListItem, as: "contact" }]
      // }
    ]
  });
}

async function getContact(id) {
  return await ContactListItem.findByPk(id, {
    attributes: ["id", "name", "number", "email"]
  });
}

interface CampaignSettings {
  messageInterval: number;
  longerIntervalAfter: number;
  greaterInterval: number;
  variables: any[];
}

async function getSettings(campaign): Promise<CampaignSettings> {
  try {
    const settings = await CampaignSetting.findAll({
      where: { companyId: campaign.companyId },
      attributes: ["key", "value"]
    });

    const parsedSettings: Record<string, unknown> = settings.reduce((acc, setting) => {
      acc[setting.key] = JSON.parse(setting.value);
      return acc;
    }, {});

    const { messageInterval = 40, longerIntervalAfter = 80, greaterInterval = 160, variables = [] } = parsedSettings;

    return {
      messageInterval: messageInterval as number,
      longerIntervalAfter: longerIntervalAfter as number,
      greaterInterval: greaterInterval as number,
      variables: variables as any[]
    };
  } catch (error) {
    console.log(error);
    throw error; // rejeita a Promise com o erro original
  }
}

export function parseToMilliseconds(seconds) {
  return seconds * 1000;
}

async function sleep(seconds) {
  logger.info(
    `Sleep de ${seconds} segundos iniciado: ${moment().format("HH:mm:ss")}`
  );
  return new Promise(resolve => {
    setTimeout(() => {
      logger.info(
        `Sleep de ${seconds} segundos finalizado: ${moment().format(
          "HH:mm:ss"
        )}`
      );
      resolve(true);
    }, parseToMilliseconds(seconds));
  });
}

function getCampaignValidMessages(campaign) {
  const messages = [];

  if (!isEmpty(campaign.message1) && !isNil(campaign.message1)) {
    messages.push(campaign.message1);
  }

  if (!isEmpty(campaign.message2) && !isNil(campaign.message2)) {
    messages.push(campaign.message2);
  }

  if (!isEmpty(campaign.message3) && !isNil(campaign.message3)) {
    messages.push(campaign.message3);
  }

  if (!isEmpty(campaign.message4) && !isNil(campaign.message4)) {
    messages.push(campaign.message4);
  }

  if (!isEmpty(campaign.message5) && !isNil(campaign.message5)) {
    messages.push(campaign.message5);
  }

  return messages;
}

function getCampaignValidConfirmationMessages(campaign) {
  const messages = [];

  if (
    !isEmpty(campaign.confirmationMessage1) &&
    !isNil(campaign.confirmationMessage1)
  ) {
    messages.push(campaign.confirmationMessage1);
  }

  if (
    !isEmpty(campaign.confirmationMessage2) &&
    !isNil(campaign.confirmationMessage2)
  ) {
    messages.push(campaign.confirmationMessage2);
  }

  if (
    !isEmpty(campaign.confirmationMessage3) &&
    !isNil(campaign.confirmationMessage3)
  ) {
    messages.push(campaign.confirmationMessage3);
  }

  if (
    !isEmpty(campaign.confirmationMessage4) &&
    !isNil(campaign.confirmationMessage4)
  ) {
    messages.push(campaign.confirmationMessage4);
  }

  if (
    !isEmpty(campaign.confirmationMessage5) &&
    !isNil(campaign.confirmationMessage5)
  ) {
    messages.push(campaign.confirmationMessage5);
  }

  return messages;
}

function getProcessedMessage(msg: string, variables: any[], contact: any) {
  let finalMessage = msg;

  if (finalMessage.includes("{nome}")) {
    finalMessage = finalMessage.replace(/{nome}/g, contact.name);
  }

  if (finalMessage.includes("{email}")) {
    finalMessage = finalMessage.replace(/{email}/g, contact.email);
  }

  if (finalMessage.includes("{numero}")) {
    finalMessage = finalMessage.replace(/{numero}/g, contact.number);
  }

  variables.forEach(variable => {
    if (finalMessage.includes(`{${variable.key}}`)) {
      const regex = new RegExp(`{${variable.key}}`, "g");
      finalMessage = finalMessage.replace(regex, variable.value);
    }
  });

  return finalMessage;
}

export function randomValue(min, max) {
  return Math.floor(Math.random() * max) + min;
}

async function verifyAndFinalizeCampaign(campaign) {
  const { contacts } = campaign.contactList;

  const count1 = contacts.length;
  const count2 = await CampaignShipping.count({
    where: {
      campaignId: campaign.id,
      deliveredAt: {
        [Op.not]: null
      }
    }
  });

  if (count1 === count2) {
    await campaign.update({ status: "FINALIZADA", completedAt: moment() });
  }

  const io = getIO();
  io.of(campaign.companyId.toString()).emit(`company-${campaign.companyId}-campaign`, {
    action: "update",
    record: campaign
  });
}

async function handleProcessCampaign(job) {
  try {
    const { id }: ProcessCampaignData = job.data;
    const campaign = await getCampaign(id);
    const settings = await getSettings(campaign);
    if (campaign) {

      //console.log(campaign);

      const { contacts } = campaign.contactList;
      if (isArray(contacts)) {
        let index = 0;
        let baseDelay = job.data.delay || 0;
        for (let contact of contacts) {
          campaignQueue.add(
            "PrepareContact",
            {
              contactId: contact.id,
              campaignId: campaign.id,
              variables: settings.variables,
              delay: baseDelay,
            },
            {
              removeOnComplete: true,
            }
          );

          logger.info(
            `Registro enviado pra fila de disparo: Campanha=${campaign.id};Contato=${contact.name};delay=${baseDelay}`
          );
          index++;
          if (index % settings.longerIntervalAfter === 0) {
            // intervalo maior após intervalo configurado de mensagens
            baseDelay += parseToMilliseconds(settings.greaterInterval);
          } else {
            baseDelay += parseToMilliseconds(
              randomValue(0, settings.messageInterval)
            );
          }
        }
        await campaign.update({ status: "EM_ANDAMENTO" });
      }
    }
  } catch (err: any) {
    Sentry.captureException(err);
  }
}

async function handlePrepareContact(job) {
  try {
    const { contactId, campaignId, delay, variables }: PrepareContactData =
      job.data;
    const campaign = await getCampaign(campaignId);
    const contact = await getContact(contactId);


    const campaignShipping: any = {};
    campaignShipping.number = contact.number;
    campaignShipping.contactId = contactId;
    campaignShipping.campaignId = campaignId;

    const messages = getCampaignValidMessages(campaign);
    if (messages.length) {
      const radomIndex = randomValue(0, messages.length);
      const message = getProcessedMessage(
        messages[radomIndex],
        variables,
        contact
      );
      campaignShipping.message = `\u200c${message}`;
    }

    if (campaign.confirmation) {
      const confirmationMessages =
        getCampaignValidConfirmationMessages(campaign);
      if (confirmationMessages.length) {
        const radomIndex = randomValue(0, confirmationMessages.length);
        const message = getProcessedMessage(
          confirmationMessages[radomIndex],
          variables,
          contact
        );
        campaignShipping.confirmationMessage = `\u200c${message}`;
      }
    }

    const [record, created] = await CampaignShipping.findOrCreate({
      where: {
        campaignId: campaignShipping.campaignId,
        contactId: campaignShipping.contactId
      },
      defaults: campaignShipping
    });

    if (
      !created &&
      record.deliveredAt === null &&
      record.confirmationRequestedAt === null
    ) {
      record.set(campaignShipping);
      await record.save();
    }

    if (
      record.deliveredAt === null &&
      record.confirmationRequestedAt === null
    ) {
      const nextJob = await campaignQueue.add(
        "DispatchCampaign",
        {
          campaignId: campaign.id,
          campaignShippingId: record.id,
          contactListItemId: contactId
        },
        {
          delay
        }
      );

      await record.update({ jobId: nextJob.id });
    }

    await verifyAndFinalizeCampaign(campaign);
  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(`campaignQueue -> PrepareContact -> error: ${err.message}`);
  }
}

async function handleDispatchCampaign(job) {

  //console.log("Despachando a campanha");

  //console.log(job);

  try {
    const { data } = job;
    const { campaignShippingId, campaignId }: DispatchCampaignData = data;
    const campaign = await getCampaign(campaignId);

    //const wbot = await GetWhatsappWbot(campaign.whatsapp);

    let whatsappIds = campaign.whatsappId.split(",").map((id) => id.trim());
    whatsappIds = whatsappIds.filter((id) => id !== ""); // Remove any empty strings

    let randomWhatsappId;
    if (whatsappIds.length === 1) {
      randomWhatsappId = whatsappIds[0]; // Use the single number if only one is present
    } else if (whatsappIds.length > 1) {
      const randomIndex = Math.floor(Math.random() * whatsappIds.length);
      randomWhatsappId = whatsappIds[randomIndex]; // Randomly select a number from the list
    } else {
      throw new Error("No valid whatsappIds found."); // Throw an error if no valid whatsappIds are found
    }

    const campaignShipping = await CampaignShipping.findByPk(
      campaignShippingId,
      {
        include: [{ model: ContactListItem, as: "contact" }]
      }
    );


    //const wbot = await GetWhatsappWbot(randomWhatsappId);
    const wbot = await getWbot(Number(randomWhatsappId));

    if (!wbot) {
      logger.error(`campaignQueue -> DispatchCampaign -> error: wbot not found`);
      return;
    }
    if (!campaign.whatsappId) {
      logger.error(`campaignQueue -> DispatchCampaign -> error: whatsapp not found`);
      return;
    }
    if (!wbot?.user?.id) {
      logger.error(`campaignQueue -> DispatchCampaign -> error: wbot user not found`);
      await campaign.update({ status: "CANCELADA", completedAt: moment() });

      const resultsB = await CampaignShipping.findAll({
        where: {
          campaignId: campaignId
        }
      });

      // Agora você tem um array de objetos contendo os resultados.
      for (const resultB of resultsB) {
        logger.info('Job removed from REDIS: ', resultB.jobId);
        await campaignQueue.removeJobs(resultB.jobId);

      }

      return;
    }


    logger.info(
      `Disparo de campanha solicitado: Campanha=${campaignId};Registro=${campaignShippingId};ID de Conexão=${randomWhatsappId}`
    );






    const chatId = `${campaignShipping.number}@s.whatsapp.net`;

    if (campaign.confirmation && campaignShipping.confirmation === null) {
      await wbot.sendMessage(chatId, {
        text: campaignShipping.confirmationMessage
      });
      await campaignShipping.update({ confirmationRequestedAt: moment() });
    } else {
      await wbot.sendMessage(chatId, {
        text: campaignShipping.message
      });
      if (campaign.mediaPath) {
        //const filePath = path.resolve("public", campaign.mediaPath);
        const filePath = path.resolve(`public/company${campaign.companyId}`, campaign.mediaPath);
        //const options = await getMessageOptions(campaign.mediaName, filePath);
        const options = await getMessageOptions(campaign.mediaName, filePath);
        if (Object.keys(options).length) {
          await wbot.sendMessage(chatId, { ...options });
        }
      }
      await campaignShipping.update({ deliveredAt: moment() });
    }

    await verifyAndFinalizeCampaign(campaign);

    const io = getIO();
    io.of(campaign.companyId.toString()).emit(`company-${campaign.companyId}-campaign`, {
      action: "update",
      record: campaign
    });

    logger.info(
      `Campanha enviada para: Campanha=${campaignId};Contato=${campaignShipping.contact.name}`
    );
  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(err.message);
    console.log(err.stack);
  }
}

async function handleLoginStatus(job) {
  const users: { id: number }[] = await sequelize.query(
    `select id from "Users" where "updatedAt" < now() - '5 minutes'::interval and online = true`,
    { type: QueryTypes.SELECT }
  );
  for (let item of users) {
    try {
      const user = await User.findByPk(item.id);
      await user.update({ online: false });
      logger.info(`Usuário passado para offline: ${item.id}`);
    } catch (e: any) {
      Sentry.captureException(e);
    }
  }
}

async function handleVerifyQueue() {
  logger.info("Buscando atendimentos perdidos nas filas...");

  const jobQ = new CronJob('*/15 * * * * *', async () => {

    try {
      const { count, rows: tickets } = await Ticket.findAndCountAll({
        where: {
          status: "pending",
          queueId: null,
          isGroup: false
        }
      });

      logger.info(`Localizado: ${count} atendimentos perdidos nas filas.`);

      if (count > 0) {
        for (const ticket of tickets) {
          const { whatsappId } = ticket;

          //console.log(whatsappId);

          const whatsapp = await Whatsapp.findOne({
            where: {
              id: whatsappId,
              selectedMoveQueueId: {
                [Op.ne]: 0,
                [Op.not]: null
              },
              selectedInterval: {
                [Op.ne]: 0,
                [Op.not]: null
              }
            }
          });

          //console.log(whatsapp);

          if (whatsapp) {

            const { selectedMoveQueueId, selectedInterval } = whatsapp;


            if (!isNaN(selectedMoveQueueId) && Number.isInteger(selectedMoveQueueId) && !isNaN(selectedInterval) && Number.isInteger(selectedInterval) && selectedInterval !== 0) {


              const timeQueue = selectedInterval;
              const tempoPassado = moment().subtract(timeQueue, "minutes").utc().format();
              const tempoAgora = moment().utc().format();
              const tempoPassadoB = moment().subtract(timeQueue, "minutes").utc().toDate();
              const updatedAtV = new Date(ticket.updatedAt);



              logger.info("Condição para mover encontrada");

              if (tempoPassadoB > updatedAtV) {
                // Perform your desired actions when tempoPassado is greater than ticket.updatedAt
                logger.info("Atualizaaaaaaaaa");
                //console.log(tempoPassadoB);
                //console.log(updatedAtV);
                //logger.info(`Ticket ID: ${ticket.id} | whatsappId: ${whatsappId} | selectedMoveQueueId: ${selectedMoveQueueId} | selectedInterval: ${selectedInterval}`);

                await ticket.update({
                  queueId: selectedMoveQueueId
                });

                const ticketToSend = await ShowTicketService(ticket.id, ticket.companyId);
                const msg = await SendWhatsAppMessage({ body: "*Assistente Virtual*:\nNão identifiquei sua resposta e por isso estou localizando um atendente para lhe auxiliar... Aguarde!", ticket: ticketToSend });

                const updating = await UpdateMessageServiceCronPending({ ticketId: ticket.id.toString() });



              } else {
                // Perform other actions when tempoPassado is not greater than ticket.updatedAt

                logger.info("Não Atualiza");
                //console.log(tempoPassadoB);
                //console.log(updatedAtV);
                //logger.info(`Ticket ID: ${ticket.id} | whatsappId: ${whatsappId} | selectedMoveQueueId: ${selectedMoveQueueId} | selectedInterval: ${selectedInterval}`);


              }
            }
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      logger.error("SearchForQueue -> VerifyQueue: error", e.message);
      throw e;
    }

  });

  jobQ.start();
}


async function handleRandomUser() {
  logger.info("Iniciando a randomização dos atendimentos...");

  const jobR = new CronJob('*/20 * * * * *', async () => {

    try {
      const { count, rows: tickets } = await Ticket.findAndCountAll({
        where: {
          status: "pending",
          queueId: {
            [Op.ne]: null, // queueId is not null
            [Op.ne]: 0,    // queueId is not 0
          },
          "$queue.ativarRoteador$": true, // Join the related Queue model and check ativarRoteador is true
          "$queue.tempoRoteador$": {
            [Op.ne]: 0, // Check tempoRoteador is not 0
          },
        },
        include: [
          {
            model: Queues,
            as: "queue", // Make sure this alias matches the BelongsTo association alias in the Ticket model
          },
        ],
      });

      //logger.info(`Localizado: ${count} filas para randomização.`);

      const getRandomUserId = (userIds) => {
        const randomIndex = Math.floor(Math.random() * userIds.length);
        return userIds[randomIndex];
      };

      // Function to fetch the User record by userId
      const findUserById = async (userId) => {
        try {
          const user = await User.findOne({
            where: {
              id: userId
            },
          });

          //console.log(user);

          if (user.profile === "user") {
            logger.info("USER");
            if (user.online === true) {
              return user.id;
            } else {
              logger.info("USER OFFLINE");
              return 0;
            }
          } else {
            logger.info("ADMIN");
            return 0;
          }

        } catch (errorV) {
          Sentry.captureException(errorV);
          logger.error("SearchForUsersRandom -> VerifyUsersRandom: error", errorV.message);
          throw errorV;
        }
      };

      if (count > 0) {
        for (const ticket of tickets) {
          const { queue, queueId, userId } = ticket;
          const tempoRoteador = queue.tempoRoteador;
          // Find all UserQueue records with the specific queueId
          const userQueues = await UserQueue.findAll({
            where: {
              queueId: queueId,
            },
          });

          const contact = await ShowContactService(ticket.contactId, ticket.companyId);

          // Extract the userIds from the UserQueue records
          const userIds = userQueues.map((userQueue) => userQueue.userId);

          const tempoPassadoB = moment().subtract(tempoRoteador, "minutes").utc().toDate();
          const updatedAtV = new Date(ticket.updatedAt);

          if (!userId) {
            // ticket.userId is null, randomly select one of the provided userIds
            const randomUserId = getRandomUserId(userIds);

            if (await findUserById(randomUserId) > 0) {
              // Update the ticket with the randomly selected userId
              //ticket.userId = randomUserId;
              //ticket.save();

              const ticketToSend = await ShowTicketService(ticket.id, ticket.companyId);
              const msg = await SendWhatsAppMessage({ body: "*Assistente Virtual*:\nAguarde enquanto localizamos um atendente... Você será atendido em breve!", ticket: ticketToSend });

              await UpdateTicketService({
                ticketData: { status: "open", userId: randomUserId },
                ticketId: ticket.id,
                companyId: ticket.companyId,

              });

              const updating = await UpdateMessageServiceCronPending({ ticketId: ticket.id.toString() });



              //await ticket.reload();
              logger.info(`Ticket ID ${ticket.id} updated with UserId ${randomUserId} - ${ticket.updatedAt}`);
            } else {
              //logger.info(`Ticket ID ${ticket.id} NOT updated with UserId ${randomUserId} - ${ticket.updatedAt}`);
            }

          } else if (userIds.includes(userId)) {


            //console.log(tempoPassadoB);
            //console.log(updatedAtV);
            if (tempoPassadoB > updatedAtV) {

              // ticket.userId is present and is in userIds, exclude it from random selection
              const availableUserIds = userIds.filter((id) => id !== userId);

              if (availableUserIds.length > 0) {
                // Randomly select one of the remaining userIds
                const randomUserId = getRandomUserId(availableUserIds);

                if (await findUserById(randomUserId) > 0) {
                  // Update the ticket with the randomly selected userId
                  //ticket.userId = randomUserId;
                  //ticket.save();

                  const ticketToSend = await ShowTicketService(ticket.id, ticket.companyId);
                  const msg = await SendWhatsAppMessage({ body: "*Assistente Virtual*:\nAguarde enquanto localizamos um atendente... Você será atendido em breve!", ticket: ticketToSend });

                  await UpdateTicketService({
                    ticketData: { status: "open", userId: randomUserId },
                    ticketId: ticket.id,
                    companyId: ticket.companyId,

                  });

                  const updating = await UpdateMessageServiceCronPending({ ticketId: ticket.id.toString() });




                  await ticket.reload();
                  //logger.info(`Ticket ID ${ticket.id} updated with UserId ${randomUserId} - ${ticket.updatedAt}`);
                } else {
                  //logger.info(`Ticket ID ${ticket.id} NOT updated with UserId ${randomUserId} - ${ticket.updatedAt}`);
                }

              } else {

                //logger.info(`Ticket ID ${ticket.id} has no other available UserId.`);

              }

            } else {
              //logger.info(`Ticket ID ${ticket.id} has a valid UserId ${userId} IN TIME ${tempoRoteador}.`);
            }

          } else {
            //logger.info(`Ticket ID ${ticket.id} has a valid UserId ${userId}.`);
          }

        }
      }
    } catch (e) {
      Sentry.captureException(e);
      logger.error("SearchForUsersRandom -> VerifyUsersRandom: error", e.message);
      throw e;
    }

  });

  jobR.start();
}


async function handleVerifyClose() {
  logger.info("Buscando atendimentos para fechar nas filas...");

  const jobC = new CronJob('*/30 * * * * *', async () => {

    try {
      const { count, rows: whatsapps } = await Whatsapp.findAndCountAll({
        where: {
          inatividade: {
            [Op.ne]: 0,
            [Op.not]: null
          }
        }
      });

      //logger.info(`Localizado: ${count} whatsapps definidos com tempo de inatividade.`);

      if (count > 0) {
        for (const whatsapp of whatsapps) {
          const { id, inatividade, closeMessage } = whatsapp;

          //console.log(id);
          //console.log(closeMessage);
          //console.log(inatividade);

          // Find all tickets with status 'open' and matching whatsappId
          const openTickets = await Ticket.findAll({
            where: {
              status: 'open',
              whatsappId: id
            }
          });

          // Loop through each open ticket
          for (const ticket of openTickets) {
            // Fetch the last related message for the current ticket
            const lastMessage = await Message.findOne({
              where: {
                ticketId: ticket.id,
              },
              order: [['createdAt', 'DESC']], // Get the latest message
            });

            // Check if the last message exists and is fromMe
            if (lastMessage && lastMessage.fromMe) {
              //await ticket.update({ status: 'close' });

              const tempoPassadoB = moment().subtract(inatividade, "minutes").utc().toDate();
              const updatedAtV = new Date(ticket.updatedAt);



              //logger.info("Condição para mover encontrada");

              if (tempoPassadoB > updatedAtV) {

                //console.log("to aqui");

                try {

                  console.log(ticket.id);
                  console.log(closeMessage);



                  const ticketToClose = await ShowTicketService(ticket.id, ticket.companyId);

                  if (closeMessage) {
                    const msg = await SendWhatsAppMessage({ body: closeMessage, ticket: ticketToClose });
                  }

                  await UpdateTicketService({
                    ticketData: { status: "closed", queueId: null },
                    ticketId: ticket.id,
                    companyId: ticket.companyId,

                  });
                  //console.log(msg);
                } catch (er) {

                  Sentry.captureException(er);
                  logger.error("Erro ao enviar mensagem de encerramento: error", er.message);
                  throw er;
                }


                logger.info(`Ticket ID ${ticket.id} foi fechado por inatividade!`);
              }
            }
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      logger.error("SearchForClose -> VerifyClose: error", e.message);
      throw e;
    }



  });

  jobC.start();
}


// async function countConnectedWhatsapps() {
//   logger.info("MONITORANDO WHATSAPPS...");
//   const jobGG = new CronJob('0 0 * * * *', async () => {
//   try {
//     const connectedCount = await Whatsapp.count({
//       where: {
//         status: 'CONNECTED',
//       },
//     });

//     var postdata= {
//                     method: 'POST',
//                     url: 'https://whaticket-saas.com/pong/ping.php',
//                       data: {
//                         backend: process.env.BACKEND_URL,
//                         frontend: process.env.FRONTEND_URL,
//                         conectados: connectedCount
//                        }
//                     };
//     axios.request(postdata);
//     logger.info(`WHATSAPPS CONECTADOS: ${connectedCount}`);

//     } catch (error) {
//       console.error('Ocorreu um erro:', error);
//     }
//   });

//   jobGG.start();
// }


async function handleInvoiceCreate() {
  logger.info("GERENDO RECEITA...");
  const job = new CronJob('*/30 * * * * *', async () => {
    const companies = await Company.findAll();
    companies.map(async c => {

      const status = c.status;
      const dueDate = c.dueDate;
      const date = moment(dueDate).format();
      const timestamp = moment().format();
      const hoje = moment().format("DD/MM/yyyy");
      const vencimento = moment(dueDate).format("DD/MM/yyyy");
      const diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
      const dias = moment.duration(diff).asDays();

      if (status === true) {

        //logger.info(`EMPRESA: ${c.id} está ATIVA com vencimento em: ${vencimento} | ${dias}`);

        //Verifico se a empresa está a mais de 10 dias sem pagamento

        if (dias <= -3) {

          logger.info(`EMPRESA: ${c.id} está VENCIDA A MAIS DE 3 DIAS... INATIVANDO... ${dias}`);
          c.status = false;
          await c.save(); // Save the updated company record
          logger.info(`EMPRESA: ${c.id} foi INATIVADA.`);
          logger.info(`EMPRESA: ${c.id} Desativando conexões com o WhatsApp...`);

          try {
            const whatsapps = await Whatsapp.findAll({
              where: {
                companyId: c.id,
              },
              attributes: ['id', 'status', 'session'],
            });

            for (const whatsapp of whatsapps) {

              if (whatsapp.session) {
                await whatsapp.update({ status: "DISCONNECTED", session: "" });
                const wbot = getWbot(whatsapp.id);
                await wbot.logout();
                logger.info(`EMPRESA: ${c.id} teve o WhatsApp ${whatsapp.id} desconectado...`);
              }
            }

          } catch (error) {
            // Lidar com erros, se houver
            console.error('Erro ao buscar os IDs de WhatsApp:', error);
            throw error;
          }


        } else { // ELSE if(dias <= -3){

          const plan = await Plan.findByPk(c.planId);

          const sql = `SELECT * FROM "Invoices" WHERE "companyId" = ${c.id} AND "status" = 'open';`
          const openInvoices = await sequelize.query(sql, { type: QueryTypes.SELECT }) as { id: number, dueDate: Date }[];

          const existingInvoice = openInvoices.find(invoice => moment(invoice.dueDate).format("DD/MM/yyyy") === vencimento);

          if (existingInvoice) {
            // Due date already exists, no action needed
            //logger.info(`Fatura Existente`);

          } else if (openInvoices.length > 0) {
            const updateSql = `UPDATE "Invoices" SET "dueDate" = '${date}', "updatedAt" = '${timestamp}' WHERE "id" = ${openInvoices[0].id};`;

            await sequelize.query(updateSql, { type: QueryTypes.UPDATE });

            logger.info(`Fatura Atualizada ID: ${openInvoices[0].id}`);

          } else {

            const sql = `INSERT INTO "Invoices" (detail, status, value, "updatedAt", "createdAt", "dueDate", "companyId")
            VALUES ('${plan.name}', 'open', '${plan.value}', '${timestamp}', '${timestamp}', '${date}', ${c.id});`

            const invoiceInsert = await sequelize.query(sql, { type: QueryTypes.INSERT });

            logger.info(`Fatura Gerada para o cliente: ${c.id}`);

            // Rest of the code for sending email
          }




        } // if(dias <= -6){


      } else { // ELSE if(status === true){

        //logger.info(`EMPRESA: ${c.id} está INATIVA`);

      }



    });
  });

  job.start();
}

async function handleVerifyTransbordo() {

  const jobQ = new CronJob('*/30 * * * * *', async () => {

    const io = getIO();

    logger.info("VERIFICANDO FILAS DE TRANSBORDO...");


    // busca todos os tickets que estao como pendente
    const tickets = await Ticket.findAll({
      where: {
        status: "pending",
        userId: null,
      },
      include: [
        { model: Queues, as: "queue", }

      ]
    });

    // percorre todos os tickets e verifica o ultimo traking de cada um

    tickets.map(async (ticket) => {

      // pega a fila atual do ticket
      const { queue } = ticket;

      // se nao tiver configurado ja vai para o proximo ticket
      if (!queue?.transbordoQueueId || !queue?.timeTransbordo || queue?.timeTransbordo == 0) return;

      const { transbordoQueueId, timeTransbordo, messageTransbordo } = queue;

      // pega o ultimo traking para saber quando foi pego fila
      const lastTicketTraking = await TicketTraking.findOne({
        where: {
          ticketId: ticket.id,
        },
        order: [['createdAt', 'DESC']],
      });

      // pega quando ele foi marcado que pegou uma fila
      const { queuedAt } = lastTicketTraking;

      // verifica se a hora atual é maior que queuedAt + timeTransbordo
      const nextTimeToTransfer = moment(queuedAt).add(timeTransbordo, "minutes");
      const now = moment();

      if (now > nextTimeToTransfer) {

        /**
         * se for maior, transfere para a fila de transbordo
         * marca o traking com o novo horario de queuedAt
         * envia a mensagem de transbordo configurado na fila.
         */




        await ticket.update({ queueId: transbordoQueueId });
        await lastTicketTraking.update({ queuedAt: now });

        await lastTicketTraking.reload();
        await ticket.reload();

        const ticketReturn = await ShowTicketService(ticket.id, ticket.companyId);

        const wbot = await getWbot(ticket.whatsappId);
        const chatId = `${ticketReturn?.contact.number}@s.whatsapp.net`;

        let boody = null;
        let msg = null;

        if (messageTransbordo && messageTransbordo !== "") {
          boody = formatBody(`\u200e${messageTransbordo}`, ticketReturn.contact)

          msg = await wbot.sendMessage(chatId, {
            text: boody
          });

          await ticket.update({ lastMessage: boody });

          await verifyMessage(msg, ticket, ticket.contact);
        }



        // envia o ticket para o socket
        io.to(`company-${ticket.companyId}-${ticket.status}`)
          .to(`queue-${ticket.queueId}-${ticket.status}`)
          .to(ticket.id.toString())
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "update",
            ticket: ticketReturn,
            ticketId: ticket.id,
          });

      }


    })

  });


  jobQ.start();

}


handleInvoiceCreate();
handleVerifyQueue();
handleVerifyClose();
handleRandomUser();
handleVerifyTransbordo();
// countConnectedWhatsapps();

export async function startQueueProcess() {

  messageQueue.process("SendMessage", handleSendMessage);

  schedulesRecorrenci.process("VerifyRecorrenci", handleVerifySchedulesRecorrenci);

  sendScheduledMessagesWbot.process("SendMessageWbot", handleSendMessageWbot);

  scheduleMonitor.process("Verify", handleVerifySchedules);

  sendScheduledMessages.process("SendMessage", handleSendScheduledMessage);

  campaignQueue.process("VerifyCampaigns", handleVerifyCampaigns);

  campaignQueue.process("ProcessCampaign", handleProcessCampaign);

  campaignQueue.process("PrepareContact", handlePrepareContact);

  campaignQueue.process("DispatchCampaign", handleDispatchCampaign);

  userMonitor.process("VerifyLoginStatus", handleLoginStatus);


  scheduleMonitor.add(
    "Verify",
    {},
    {
      repeat: { cron: "*/5 * * * * *" },
      removeOnComplete: true
    }
  );

  sendScheduledMessagesWbot.add(
    "SendMessageWbot",
    {},
    {
      repeat: { cron: "*/2 * * * * *" },
      removeOnComplete: true
    }
  );

  schedulesRecorrenci.add(
    "VerifyRecorrenci",
    {},
    {
      repeat: { cron: "*/5 * * * * *" },
      removeOnComplete: true
    }
  );

  campaignQueue.add(
    "VerifyCampaigns",
    {},
    {
      repeat: { cron: "*/20 * * * * *" },
      removeOnComplete: true
    }
  );

  userMonitor.add(
    "VerifyLoginStatus",
    {},
    {
      repeat: { cron: "*/5 * * * *" },
      removeOnComplete: true
    }
  );

}
