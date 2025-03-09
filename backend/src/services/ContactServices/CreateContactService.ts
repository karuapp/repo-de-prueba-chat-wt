import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";

import * as fs from 'fs';
import path from 'path';
import { cwd } from "process";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  acceptAudioMessage?: boolean;
  active?: boolean;
  companyId: number;
  extraInfo?: ExtraInfo[];
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  acceptAudioMessage,
  active,
  companyId,
  extraInfo = []
}: Request): Promise<Contact> => {

  //  const newArrayToAdd = [
  //   { name: 'Código', value: '0' },
  //   { name: 'Valor do Lead', value: '0' },
  //   { name: 'CEP', value: '0' },
  //   { name: 'Endereço', value: '0' },
  //   { name: 'Número', value: '0' },
  //   { name: 'Complemento', value: '0' },
  //   { name: 'Bairro', value: '0' },
  //   { name: 'Cidade', value: '0' },
  //   { name: 'Nascimento', value: '0' },
  //   { name: 'CPF', value: '0' },
  //   { name: 'RG', value: '0' },
  //   { name: 'Passaporte', value: '0' },
  //   { name: 'Validade Passaporte', value: '0' },
  //   { name: 'Observações', value: '0' },
  //   { name: 'Vendedor', value: '0' },
  //   { name: 'Inscrição Municipal', value: '0' },
  //   { name: 'Sexo', value: '0' },
  //   { name: 'Estrangeiro', value: '0' }
  // ];

  const newArrayToAdd = [
    { name: 'Código Interno', value: '0' },
    { name: 'Valor do Lead', value: '0' },
    { name: 'Sexo', value: '0' },
    { name: 'Nascimento', value: '0' },
    { name: 'CPF', value: '0' },
    { name: 'RG', value: '0' },
    { name: 'CNPJ', value: '0' },
    { name: 'CEP', value: '0' },
    { name: 'Endereço', value: '0' },
    { name: 'Número', value: '0' },
    { name: 'Complemento', value: '0' },
    { name: 'Bairro', value: '0' },
    { name: 'Cidade', value: '0' },
    { name: 'Vendedor', value: '0' }
  ];

  const updatedExtraInfo = [...extraInfo, ...newArrayToAdd];

  // const clientExtraFieldsPath = path.join(cwd(), "ClientFields.json");

  // const clientExtraFieldsData = fs.readFileSync(clientExtraFieldsPath, "utf-8");

  // const updatedExtraInfo = [...extraInfo, ...clientExtraFieldsData];


  const numberExists = await Contact.findOne({
    where: { number, companyId }
  });

  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const contact = await Contact.create(
    {
      name,
      number,
      email,
      acceptAudioMessage,
      active,
      extraInfo: updatedExtraInfo,
      companyId
    },
    {
      include: ["extraInfo"]
    }
  );

  return contact;
};

export default CreateContactService;
