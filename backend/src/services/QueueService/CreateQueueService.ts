import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import { TypebotService } from "../TypebotService/apiTypebotService";
import { N8nService } from "../N8nService/apiN8nService";

interface QueueData {
  name: string;
  color: string;
  companyId: number;
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
  n8n?: string
  n8nId?: string
  timeTransbordo?: number,
  transbordoQueueId?: number,
  messageTransbordo?: string
}

const CreateQueueService = async (queueData: QueueData): Promise<Queue> => {
  const { color, name, companyId, prioridade, ativarRoteador, tempoRoteador } = queueData;

  const company = await Company.findOne({
    where: {
      id: companyId
    },
    include: [{ model: Plan, as: "plan" }]
  });

  if (company !== null) {
    const queuesCount = await Queue.count({
      where: {
        companyId
      }
    });

    if (queuesCount >= company.plan.queues) {
      throw new AppError(`Número máximo de filas já alcançado: ${queuesCount}`);
    }
  }

  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .required("ERR_QUEUE_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_QUEUE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameName = await Queue.findOne({
              where: { name: value, companyId }
            });

            return !queueWithSameName;
          }
          return false;
        }
      ),
    color: Yup.string()
      .required("ERR_QUEUE_INVALID_COLOR")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return false;
      })
      .test(
        "Check-color-exists",
        "ERR_QUEUE_COLOR_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameColor = await Queue.findOne({
              where: { color: value, companyId }
            });
            return !queueWithSameColor;
          }
          return false;
        }
      )
  });

  try {
    await queueSchema.validate({ color, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (queueData.typebotId) {
    const { typebot } = await TypebotService.getTypebot(companyId, queueData.typebotId)
    queueData = {
      ...queueData,
      publicId: typebot?.publicId
    }
  }

  if (queueData.n8n) {
    const n8n = await N8nService.getN8N(companyId, queueData.n8n)
    queueData = {
      ...queueData,
      n8n: n8n
    }
  }

  const queue = await Queue.create(queueData);

  return queue;
};

export default CreateQueueService;
