import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Oportunidade from "../../models/Oportunidade";

interface Request {
  name: string;
  companyId: number;
  ticketInfo?: string;
  ticketId?: number;
  tagId?: number;
  userId: number;
  funil?: string;
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

const CreateService = async ({
  name,
  companyId,
  ticketInfo,
  ticketId,
  tagId,
  userId,
  funil,
  etapadofunil,
  fonte,
  campanha,
  datadeida,
  datadevolta,
  origem,
  destino,
  valor,
  produto
  
}: Request): Promise<Oportunidade> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(3)
      .test(
        "Check-unique-name",
        "ERR_OPORTUNIDADE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const tagWithSameName = await Oportunidade.findOne({
              where: { name: value }
            });

            return !tagWithSameName;
          }
          return false;
        }
      )
  });

  try {
    await schema.validate({ name });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new AppError(err.message);
  }
  const [oportunidade] = await Oportunidade.findOrCreate({
    where: { name, funil, etapadofunil },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignores
    defaults: {
      name,
  	  companyId,
      ticketInfo,
      ticketId,
      tagId,
      userId,
      funil,
      etapadofunil,
      fonte,
      campanha,
      datadeida,
      datadevolta,
      origem,
      destino,
      valor,
      produto
    },
  });


  await oportunidade.reload({
    attributes: ["id", "name","companyId"],
  });

  return oportunidade;
};

export default CreateService;
