import { initWASocket } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import Company from "../../models/Company";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";
import * as Sentry from "@sentry/node";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {

  // Retrieve the associated Company from the database using the companyId
  const company = await Company.findByPk(companyId, { attributes: ['id', 'status'] });

  // Check if the company exists and if its 'status' is true
  if (!company || !company.status) {
    throw new Error("Sua empresa não pode conectar ao WhatsApp neste instante!");
  }


  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  try {
    const wbot = await initWASocket(whatsapp);
    wbotMessageListener(wbot, companyId);
    wbotMonitor(wbot, whatsapp, companyId);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};
