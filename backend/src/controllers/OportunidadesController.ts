import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import CreateService from "../services/OportunidadeServices/CreateService";
import ListService from "../services/OportunidadeServices/ListService";
import UpdateService from "../services/OportunidadeServices/UpdateService";
import ShowService from "../services/OportunidadeServices/ShowService";
import DeleteService from "../services/OportunidadeServices/DeleteService";
import SimpleListService from "../services/OportunidadeServices/SimpleListService";
import DeleteAllService from "../services/OportunidadeServices/DeleteAllService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

type MessageData = {
  ratingId: number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { ratings, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });


  return res.json({ ratings, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, funil, etapadofunil, ticketInfo, ticketId, tagId , fonte, campanha, datadeida, datadevolta, origem, destino, valor, produto, userId} = req.body;
  const { companyId } = req.user;

  const rating = await CreateService({
    name,
    funil, 
    etapadofunil, 
    ticketInfo,
    ticketId,
    tagId,
    fonte,
    campanha,
    datadeida,
    datadevolta,
    origem,
    destino,
    valor,
    produto,
    companyId,
    userId
  });

  const io = getIO();
 io.emit("oportunidade", {
    action: "create",
    rating
  });

  return res.status(200).json(rating);
};


export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ratingId } = req.params;
  const { companyId } = req.user;

  const rating = await ShowService(ratingId, companyId);

  return res.status(200).json(rating);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  

  const { ratingId } = req.params;
  const OportunidadeData = req.body;
  const { companyId } = req.user;

  const oportunidade = await UpdateService({ OportunidadeData, id: ratingId, companyId });

  const io = getIO();
 io.emit("oportunidade", {
    action: "update",
    oportunidade
  });

  return res.status(200).json(oportunidade);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ratingId } = req.params;
  const { companyId } = req.user;

  await DeleteService(ratingId, companyId);

  const io = getIO();
 io.emit("oportunidade", {
    action: "delete",
    ratingId
  });

  return res.status(200).json({ message: "Oportunidade deleted" });
};

export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  await DeleteAllService(companyId);

  return res.send();
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const ratings = await SimpleListService({ searchParam, companyId });

  return res.json(ratings);
};
