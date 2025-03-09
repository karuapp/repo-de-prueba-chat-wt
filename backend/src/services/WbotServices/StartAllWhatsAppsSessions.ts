import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import * as Sentry from "@sentry/node";

export const StartAllWhatsAppsSessions = async (
  companyId: number
): Promise<void> => {
  try {
    const whatsapps = await ListWhatsAppsService({ companyId });
    if (whatsapps.length > 0) {
      whatsapps.forEach(whatsapp => {
        StartWhatsAppSession(whatsapp, companyId);
      });
    }
  } catch (e) {
    Sentry.captureException(e);
  }
};

/*
import cluster from 'cluster';
import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import * as Sentry from "@sentry/node";

const getRandomDelay = (): number => {
  // Generate a random number between 30 and 240 seconds (inclusive)
  return Math.floor(Math.random() * (240 - 30 + 1)) + 30;
};

export const StartAllWhatsAppsSessions = async (
  companyId: number
): Promise<void> => {
  try {
    const whatsapps = await ListWhatsAppsService({ companyId });
    if (whatsapps.length > 0) {
      for (const whatsapp of whatsapps) {
        await new Promise((resolve) => {
        
          //const delay = getRandomDelay();
          const delay = 1;
          const workerId = cluster.worker.id;

          console.log("INICIALIZADO WHATSAPP: ", whatsapp.id);
          console.log("PID: ", process.pid);
          console.log("WID: ", workerId);
          console.log("DELAY: ", delay);
            
        
          setTimeout(() => {   
           
          	if(workerId === 1){
            	StartWhatsAppSession(whatsapp, companyId);
          	}
            resolve(true); 
          }, delay * 1000); 
        });
      }
    }
  } catch (e) {
    Sentry.captureException(e);
  }
};
*/