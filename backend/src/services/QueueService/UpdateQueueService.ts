import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import ShowQueueService from "./ShowQueueService";
import { TypebotService } from "../TypebotService/apiTypebotService";
import { N8nService } from "../N8nService/apiN8nService";

interface QueueData {
  name?: string;
  color?: string;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  schedules?: any[];
  isChatbot?: boolean;
  prioridade: number;
  ativarRoteador?: boolean;
  tempoRoteador: number;
  workspaceTypebot?: string;
  typeChatbot?: string;
  typebotId?: string;
  publicId?: string;
  resetChatbotMsg?: Boolean;
  n8n?: string;
  n8nId?: string;
  timeTransbordo?: number | string,
  transbordoQueueId?: number,
  messageTransbordo?: string
}

const UpdateQueueService = async (
  queueId: number | string,
  queueData: QueueData,
  companyId: number
): Promise<Queue> => {
  const { color, name, prioridade, ativarRoteador, tempoRoteador, transbordoQueueId } = queueData;

  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_QUEUE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameName = await Queue.findOne({
              where: { name: value, id: { [Op.ne]: queueId }, companyId }
            });

            return !queueWithSameName;
          }
          return true;
        }
      ),
    color: Yup.string()
      .required("ERR_QUEUE_INVALID_COLOR")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return true;
      })
      .test(
        "Check-color-exists",
        "ERR_QUEUE_COLOR_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameColor = await Queue.findOne({
              where: { color: value, id: { [Op.ne]: queueId }, companyId }
            });
            return !queueWithSameColor;
          }
          return true;
        }
      )
  });

  try {
    await queueSchema.validate({ color, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const queue = await ShowQueueService(queueId, companyId);

  if (queue?.companyId !== companyId) {
    throw new AppError("Não é permitido alterar registros de outra empresa");
  }



  if (queueData?.typebotId) {
    const { typebot } = await TypebotService.getTypebot(companyId, queueData.typebotId)
    queueData = {
      ...queueData,
      publicId: typebot?.publicId
    }
  }

  if (queueData?.n8n) {
    const n8n = await N8nService.getN8N(companyId, queueData.n8n)
    queueData = {
      ...queueData,
      n8n: n8n
    }
  }

  // @ts-ignore
  if (transbordoQueueId == "") {
    queueData.transbordoQueueId = null;
  }

  await queue.update(queueData);

  return queue;
};

export default UpdateQueueService;
