import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";

interface Request {
  contactGroup:string
  contactMember: string;
  companyId: number;
  whatsappId: number;
}

const RemoveMemberGroupService = async ({
  contactGroup,
  contactMember,
  companyId,
  whatsappId
}: Request): Promise<any> => {
  try {
    const numberExists = await Contact.findOne({
      where: { number: contactGroup, companyId }
    });

    if (!numberExists) {
      throw new AppError("CONTACT_NOT_FOUND");
    }

    const wbot = getWbot(Number(whatsappId));

    const response = await wbot.groupParticipantsUpdate(
        `${contactGroup}@g.us`, 
        [contactMember],
        "remove" // replace this parameter with "remove", "demote" or "promote"
    )

    return response ;
  } catch (error) {
    // Log o erro ou trate conforme necessário
    throw new AppError("INTERNAL_ERROR");
  }
};

export default RemoveMemberGroupService;
