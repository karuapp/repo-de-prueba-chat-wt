import { getIO } from "../../libs/socket";
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
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  channel?: string;
  extraInfo?: ExtraInfo[];
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  channel = "whatsapp",
  companyId,
  extraInfo = []
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");


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

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({
    where: {
      number,
      companyId
    }
  });

  if (contact) {

    contact.update({ profilePicUrl });

    if (isGroup) {
      contact.update({ name });
    }

    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });
  } else {

    contact = await Contact.create(
    {
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      extraInfo: updatedExtraInfo,
      companyId,
      channel
    },
    {
      include: ["extraInfo"]
    }
    );

    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactService;
