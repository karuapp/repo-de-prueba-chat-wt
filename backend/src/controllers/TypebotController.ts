import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { TypebotService } from "../services/TypebotService/apiTypebotService";

type IndexQuery = {
  workspaceId: string;
};

export const listWrkspace = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const workspaces = await TypebotService.listWorkspace(companyId)

  return res.json(workspaces);
};

export const listTypebots = async (req: Request, res: Response): Promise<Response> => {
  const { workspaceId } = req.query as IndexQuery;
  const { companyId } = req.user;

  const typebots = await TypebotService.listTypebots(companyId, workspaceId)

  return res.json(typebots);
};
