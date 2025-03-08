import AppError from "../../errors/AppError";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import logger from "../../utils/logger";
import ContactWallet from "../../models/ContactWallet";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Wallet {
  walletId: number | string;
  contactId: number | string;
  companyId: number | string;
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
  remoteJid?: string;
  wallets?: null | number[] | string[];
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  acceptAudioMessage,
  active,
  companyId,
  extraInfo = [],
  remoteJid = "",
  wallets
}: Request): Promise<Contact> => {

  const settings = await CompaniesSettings.findOne({
    where: { companyId }
  });

  const acceptAudioMessageContact = settings?.acceptAudioMessageContact === 'enabled' ? true : false;

  try {
    const [contact, created] = await Contact.findOrCreate({
      where: { number, companyId },
      defaults: { 
        name, 
        email, 
        acceptAudioMessage: acceptAudioMessageContact,
        active, 
        remoteJid, 
        companyId 
      }
    });

    if (!created) {
      logger.warn(`Contato com número ${number} já existe para a empresa ${companyId}.`);
      return contact;
    }

    contact.acceptAudioMessage = acceptAudioMessageContact;
    await contact.save();

    await contact.reload({
      include: [
        {
          association: "extraInfo",
        },
        {
          association: "wallets",
          attributes: ["id", "name"]
        }
      ]
    });

    if (wallets) {
      await ContactWallet.destroy({
        where: {
          companyId,
          contactId: contact.id
        }
      });

      const contactWallets: Wallet[] = [];
      wallets.forEach((wallet: any) => {
        contactWallets.push({
          walletId: wallet.id ? wallet.id : wallet,
          contactId: contact.id,
          companyId
        });
      });

      await ContactWallet.bulkCreate(contactWallets);
    }

    return contact;

  } catch (error) {
    logger.error("Erro ao criar ou atualizar o contato", error);
    throw error;
  }
};

export default CreateContactService;
