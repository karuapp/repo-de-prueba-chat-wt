import Bull from 'bull';
import {WASocket, MessageUpsertType, proto,} from '@whiskeysockets/baileys';
import { Store } from "../../libs/store";
import { handleMessage } from './wbotMessageListener';
import configLoader from '../ConfigLoaderService/configLoaderService';

interface ImessageUpsert {
    messages: proto.IWebMessageInfo[];
    type: MessageUpsertType;
  }

  type Session = WASocket & {
    id?: number;
    store?: Store;
  };
  

const processMsgQueue = new Bull('processMsgQueue', {
  redis: {
    host: 'localhost',
    port: 6379,
  },
  defaultJobOptions: {
    attempts: configLoader().webhook.attempts, // Número de tentativas em caso de falha
    backoff: {
        type: configLoader().webhook.backoff.type, // Tipo de atraso entre tentativas, pode ser 'fixed' ou 'exponential'
        delay: configLoader().webhook.backoff.delay, // Tempo em milissegundos antes de tentar novamente
    },
    removeOnFail: true, // Remove o job da fila quando falha
    removeOnComplete: true, // Remove o job da fila quando completado com sucesso
},
limiter: {
    max: configLoader().webhook.limiter.max, // Define o número máximo de jobs processados por unidade de tempo
    duration: configLoader().webhook.limiter.duration, // Define a duração em milissegundos durante a qual o limite máximo é aplicado
},
});

processMsgQueue.process(async (job) => {
  const { msg, wbot, companyId  } = job.data;
  try {
    await handleMessage(msg, wbot, companyId );
    // Remover o job após um atraso de 5 segundos
    setTimeout(() => {
      job.remove()
        .then(() => {
          console.log(`Job ${job.id} removido com sucesso após conclusão.`);
        })
        .catch(err => {
          console.log(`Erro ao remover job ${job.id}: ${err}`);
        });
    }, 5000);
  } catch (error) {
    console.error('Erro ao processar o job:', error);
    // Você também pode remover o job em caso de erro, caso deseje
    // await job.remove();
  }
});

export const addProcessMsgJob = async (  msg: proto.IWebMessageInfo, wbot: Session, companyId: number,) => {
  await processMsgQueue.add({ msg, wbot, companyId });
};
