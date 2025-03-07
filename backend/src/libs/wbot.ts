import * as Sentry from "@sentry/node";
import makeWASocket, {
  WASocket,
  Browsers,
  proto,
  AuthenticationState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  AuthenticationCreds,
  makeInMemoryStore,
  isJidBroadcast,
  jidNormalizedUser,
  makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import P from "pino";
import { FindOptions } from "sequelize/types";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger";
import authState from "../helpers/authState";
import { Boom } from "@hapi/boom";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { Store } from "./store";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { Op } from "sequelize";
import { number } from "yup";

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface IMessage {
  messages: IMessage[];
  isLatest: boolean;
}

const sessions: Session[] = [];


//console.log(sessions);


const retriesQrCodeMap = new Map<number, number>();

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }

  //console.log(sessionIndex);

  // mostra a bateria do celular
  console.log(sessions[sessionIndex]);

  return sessions[sessionIndex];
};

export const restartWbot = async (
  companyId: number,
  session?: any
): Promise<void> => {
  try {
    const options: FindOptions = {
      where: {
        companyId,
      },
      attributes: ["id"],
    }





    const whatsapp = await Whatsapp.findAll(options);

    whatsapp.map(async c => {

      logger.info(`Restarting session ${c.id}`);

      const sessionIndex = sessions.findIndex(s => s.id === c.id);




      if (sessionIndex !== -1) {
        const desconectando = sessions[sessionIndex].ws.close();


        logger.info(`Restarting session ${desconectando}`);


      }

    });

  } catch (err) {
    logger.error(err);
  }
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout();
        sessions[sessionIndex].ws.close();
      }

      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {

  return new Promise(async (resolve, reject) => {
    try {
      (async () => {
        const io = getIO();

        const whatsappUpdate = await Whatsapp.findOne({
          where: { id: whatsapp.id }
        });

        if (!whatsappUpdate) return;

        const { id, name, provider } = whatsappUpdate;

        const { version, isLatest } = await fetchLatestBaileysVersion();
        const isLegacy = provider === "stable" ? true : false;

        //logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        //logger.info(`isLegacy: ${isLegacy}`);
        //logger.info(`Starting session ${name}`);
        let retriesQrCode = 0;

        let wsocket: Session = null;
        const store = makeInMemoryStore({
          logger: loggerBaileys
        });

        const { state, saveState } = await authState(whatsapp);


        wsocket = makeWASocket({
          version,
          logger: loggerBaileys,
          printQRInTerminal: false,
          auth: state as AuthenticationState,
          generateHighQualityLinkPreview: false,
          shouldIgnoreJid: jid => isJidBroadcast(jid),
          browser: Browsers.appropriate("Desktop"),
          defaultQueryTimeoutMs: 0,
          patchMessageBeforeSending: (msg) => {
            const requiresPatch = !!(
              msg.buttonsMessage ||
              // || message.templateMessage
              msg.listMessage
            );
            if (requiresPatch) {
              const patchMessageBeforeSending = (msg: proto.IMessage) => {
                const isProductList = (listMessage: proto.Message.IListMessage | null | undefined) =>
                  listMessage?.listType === proto.Message.ListMessage.ListType.PRODUCT_LIST

                if (isProductList(msg.deviceSentMessage?.message?.listMessage) || isProductList(msg.listMessage)) {
                  msg = JSON.parse(JSON.stringify(msg))
                  if (msg.deviceSentMessage?.message?.listMessage) {
                    msg.deviceSentMessage.message.listMessage.listType = proto.Message.ListMessage.ListType.SINGLE_SELECT
                  }
                  if (msg.listMessage) {
                    msg.listMessage.listType = proto.Message.ListMessage.ListType.SINGLE_SELECT
                  }
                }
                return msg
              }
            }


            return msg;
          },
        })

        wsocket.ev.on(
          "connection.update",
          async ({ connection, lastDisconnect, qr }) => {
            // logger.info(
            //   `Socket  ${name} Connection Update ${connection || ""} ${lastDisconnect || ""
            //   }`
            // );

            if (connection === "close") {
              if ((lastDisconnect?.error as Boom)?.output?.statusCode === 403) {
                await whatsapp.update({ status: "PENDING", session: "" });
                await DeleteBaileysService(whatsapp.id);
                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
              }
              if (
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut
              ) {
                removeWbot(id, false);
                setTimeout(
                  () => StartWhatsAppSession(whatsapp, whatsapp.companyId),
                  2000
                );
              } else {
                await whatsapp.update({ status: "PENDING", session: "" });
                await DeleteBaileysService(whatsapp.id);
                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
                setTimeout(
                  () => StartWhatsAppSession(whatsapp, whatsapp.companyId),
                  2000
                );
              }
            }

            if (connection === "open") {

              // numero conectado no whatsapp
              const phoneNumber = wsocket.user.id.replace(/\D/g, "")
              // console.log('telefone conectado -> ', phoneNumber);

              await whatsapp.update({
                status: "CONNECTED",
                qrcode: "",
                retries: 0,
                number: phoneNumber
              });

              io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });

              const sessionIndex = sessions.findIndex(
                s => s.id === whatsapp.id
              );
              if (sessionIndex === -1) {
                wsocket.id = whatsapp.id;
                sessions.push(wsocket);
              }

              resolve(wsocket);
            }

            if (qr !== undefined) {
              if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
                await whatsappUpdate.update({
                  status: "DISCONNECTED",
                  qrcode: ""
                });
                await DeleteBaileysService(whatsappUpdate.id);
                io.emit("whatsappSession", {
                  action: "update",
                  session: whatsappUpdate
                });
                wsocket.ev.removeAllListeners("connection.update");
                wsocket.ws.close();
                wsocket = null;
                retriesQrCodeMap.delete(id);
              } else {
                logger.info(`Session QRCode Generate ${name}`);
                retriesQrCodeMap.set(id, (retriesQrCode += 1));

                await whatsapp.update({
                  qrcode: qr,
                  status: "qrcode",
                  retries: 0
                });
                const sessionIndex = sessions.findIndex(
                  s => s.id === whatsapp.id
                );

                if (sessionIndex === -1) {
                  wsocket.id = whatsapp.id;
                  sessions.push(wsocket);
                }

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
              }
            }
          }
        );



        wsocket.ev.on("creds.update", saveState);

        wsocket.ev.on(
          "presence.update",
          async ({ id: remoteJid, presences }) => {

            try {
              logger.debug(
                { remoteJid, presences },
                "Received contact presence"
              );
              if (!presences[remoteJid]?.lastKnownPresence) {
                console.debug("Received invalid presence");
                return;
              }
              const contact = await Contact.findOne({
                where: {
                  number: remoteJid.replace(/\D/g, ""),
                  companyId: whatsapp.companyId
                }
              });
              if (!contact) {
                return;
              }



              const ticket = await Ticket.findOne({
                where: {
                  contactId: contact.id,
                  whatsappId: whatsapp.id,
                  status: {
                    [Op.or]: ["open", "pending"]
                  }
                }
              });

              if (ticket) {

                // io.to(ticket.id.toString())
                //   // .to(ticket.status)
                //   .to(`company-${whatsapp.companyId}-${ticket.status}`)
                //   .emit(`company-${whatsapp.companyId}-presence`, {
                //     action: "update-presence",
                //     ticketId: ticket.id,
                //     presence: presences[remoteJid].lastKnownPresence
                //   });

              }
            } catch (error) {
              logger.error(
                { remoteJid, presences },
                "presence.update: error processing"
              );
              if (error instanceof Error) {
                logger.error(`Error: ${error.name} ${error.message}`);
              } else {
                logger.error(`Error was object of type: ${typeof error}`);
              }
            }
          }
        );

        store.bind(wsocket.ev);
      })();
    } catch (error) {
      Sentry.captureException(error);
      // console.log(error);
      reject(error);
    }
  });
};
