import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { N8nService } from "../services/N8nService/apiN8nService"

type IndexQuery = {
  workspaceId: string;
};

export const listWrkFlow = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const workspaces = await N8nService.listWorkFlow(companyId)

  return res.json(workspaces);
};
