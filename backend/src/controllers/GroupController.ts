import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import ListService from "../services/GroupServices/ListService";
import GetMembersGroupService from "../services/GroupService/ListMembersGroupContactService";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import CreateGroupService from "../services/GroupService/CreateGroupService";
import RemoveMemberGroupService from "../services/GroupService/RemoveMemberGroupService";


type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

interface CreateTicketGroupData {
  contactsAddGroup: string[];
  status: string;
  queueId: number;
  userId: number;
  whatsappId?: number;
  justClose: boolean;
  sendFarewellMessage?: boolean;
  oportunidadeId?: number
  titleGroup: string;
}

interface RemoveMemberGroup {
  contactGroup: string;
  contactMember: string;
  whatsappId: number
}


export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  //console.log(searchParam);

  const { groups, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ groups, count, hasMore });
};

export const getMembersGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactNumber,  whatsappId} = req.params
  const { companyId } = req.user;

  const getResultMembersGroup = await GetMembersGroupService({contactNumber,companyId,whatsappId})

  console.log(getResultMembersGroup)

  return res.status(200).json(getResultMembersGroup);
};

export const storeGroupAndTicket = async (req: Request, res: Response): Promise<Response> => {
  const { contactsAddGroup, status, userId, queueId, whatsappId, titleGroup }: CreateTicketGroupData = req.body;
  const { companyId } = req.user;

  try {
    const createdGroup = await CreateGroupService({ contactsAddGroup, whatsappId, titleGroup, companyId });

    if (createdGroup.id) {
      console.log('343Entrei')
      const contactId = createdGroup.id

      const ticket = await CreateTicketService({
        contactId,
        status,
        userId,
        companyId,
        queueId,
        whatsappId
      });

      console.log(ticket.isGroup)

      const io = getIO();
      io.to(`company-${companyId}-${ticket.status}`)
        .to(`queue-${ticket.queueId}-${ticket.status}`)
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket
        });

      return res.status(200).json(ticket);
    }

  } catch (error) {
    // Trate o erro de forma apropriada aqui
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  // Se o fluxo não entrar no bloco "if" ou lançar uma exceção, ainda assim retorne uma resposta HTTP 200
  return res.status(200).send();
}


export const removeMemberGroup = async (req: Request, res: Response): Promise<Response> => {

  const {contactGroup,contactMember, whatsappId} = req.body as RemoveMemberGroup;
  const {companyId} = req.user

  const memberRemove = await RemoveMemberGroupService ({
    contactGroup,
    contactMember,
    whatsappId,
    companyId
  })

  return res.status(200).json(memberRemove)
}