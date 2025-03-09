import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";

interface Request {
  contactNumber: string;
  companyId: number;
  whatsappId: string;
}

const GetMembersGroupService = async ({
  contactNumber,
  companyId,
  whatsappId
}: Request): Promise<any> => {
  try {
    const numberExists = await Contact.findOne({
      where: { number: contactNumber, companyId }
    });

    if (!numberExists) {
      throw new AppError("CONTACT_NOT_FOUND");
    }

    const wbot = getWbot(Number(whatsappId));
    const members = await wbot.groupMetadata(`${contactNumber}@g.us`);

    return members.participants;
  } catch (error) {
    // Log o erro ou trate conforme necessário
    throw new AppError("INTERNAL_ERROR");
  }
};

export default GetMembersGroupService;
