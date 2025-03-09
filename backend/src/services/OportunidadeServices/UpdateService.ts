import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Oportunidade from "../../models/Oportunidade";
import ShowService from "./ShowService";


interface OportunidadeData {
  id?: number;
  name: string;
  funil?: string;
  ticketInfo?: string;
  ticketId: number
  tagId?: number
  etapadofunil?: string;
  fonte?: string;
  campanha?: string;
  datadeida?: string;
  datadevolta?: string;
  origem?: string;
  destino?: string;
  valor?: string;
  produto?: string; 
}

interface Request {
  OportunidadeData: OportunidadeData;
  id: string | number;
  companyId: number;
}

const UpdateService = async ({
  OportunidadeData,
  id,
  companyId
}: Request): Promise<Oportunidade | undefined> => {
  const Oportunidades = await ShowService(id, companyId);

  const schema = Yup.object().shape({
    name: Yup.string().min(3)
  });

  const { name, funil,   ticketInfo, etapadofunil, fonte, campanha, datadeida, datadevolta, origem, destino, valor, produto, ticketId, tagId } = OportunidadeData;

  try {
    await schema.validate({ name });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new AppError(err.message);
  }


  await Oportunidades.update({
    name,
    funil,
    ticketInfo,
    ticketId,
    tagId,
    etapadofunil,
    fonte,
    campanha,
    datadeida,
    datadevolta,
    origem,
    destino,
    valor,
    produto
  });

  await Oportunidades.reload({
    attributes: ["id", "name", "companyId"]
  });
  return Oportunidades;
};

export default UpdateService;
