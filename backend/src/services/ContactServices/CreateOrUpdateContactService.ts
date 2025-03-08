import { getIO } from "../../libs/socket";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import fs from "fs";
import path, { join } from "path";
import logger from "../../utils/logger";
import { isNil } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import * as Sentry from "@sentry/node";
import axios from 'axios';

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
  remoteJid?: string;
  whatsappId?: number;
  wbot?: any;
}

const downloadProfileImage = async ({
  profilePicUrl,
  companyId,
  contact
}) => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");
  
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    fs.chmodSync(folder, 0o777);
  }

  if (profilePicUrl.includes("nopicture.png")) {
    return "nopicture.png";
  }

  try {
    const response = await axios.get(profilePicUrl, {
      responseType: 'arraybuffer',
      timeout: 5000
    });

    const filename = `${new Date().getTime()}.jpeg`;
    const filePath = join(folder, filename);
    
    fs.writeFileSync(filePath, response.data);
    return filename;

  } catch (error) {
    console.error("Profile image download failed:", error.message);
    Sentry.captureException(error);
    return "nopicture.png";
  }
};

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  channel = "whatsapp",
  companyId,
  extraInfo = [],
  remoteJid = "",
  whatsappId,
  wbot
}: Request): Promise<Contact> => {
  try {
    let createContact = false;
    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");
    const io = getIO();
    let contact: Contact | null;

    contact = await Contact.findOne({
      where: { number, companyId }
    });

    let updateImage = (!contact || contact?.profilePicUrl !== profilePicUrl && profilePicUrl !== "") && wbot || false;

    if (contact) {
      contact.remoteJid = remoteJid;
      contact.profilePicUrl = profilePicUrl || null;
      contact.isGroup = isGroup;
      if (isNil(contact.whatsappId)) {
        const whatsapp = await Whatsapp.findOne({
          where: { id: whatsappId, companyId }
        });

        if (whatsapp) {
          contact.whatsappId = whatsappId;
        }
      }
      const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");

      let fileName, oldPath = "";
      if (contact.urlPicture) {
        oldPath = path.resolve(contact.urlPicture.replace(/\\/g, '/'));
        fileName = path.join(folder, oldPath.split('\\').pop());
      }
      if (!fs.existsSync(fileName) || contact.profilePicUrl === "") {
        if (wbot && ['whatsapp'].includes(channel)) {
          try {
            profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
          } catch (e) {
            Sentry.captureException(e);
            profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
          }
          contact.profilePicUrl = profilePicUrl;
          updateImage = true;
        }
      }

      if (contact.name === number) {
        contact.name = name;
      }

      await contact.save();
      await contact.reload();

    } else if (wbot && ['whatsapp'].includes(channel)) {
      const settings = await CompaniesSettings.findOne({ where: { companyId } });
      const { acceptAudioMessageContact } = settings;
      let newRemoteJid = remoteJid;

      if (!remoteJid && remoteJid !== "") {
        newRemoteJid = isGroup ? `${rawNumber}@g.us` : `${rawNumber}@s.whatsapp.net`;
      }

      try {
        profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
      } catch (e) {
        Sentry.captureException(e);
        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
      }

      contact = await Contact.create({
        name,
        number,
        email,
        isGroup,
        companyId,
        channel,
        acceptAudioMessage: acceptAudioMessageContact === 'enabled' ? true : false,
        remoteJid: newRemoteJid,
        profilePicUrl,
        urlPicture: "",
        whatsappId
      });

      createContact = true;
    } else if (['facebook', 'instagram'].includes(channel)) {
      contact = await Contact.create({
        name,
        number,
        email,
        isGroup,
        companyId,
        channel,
        profilePicUrl,
        urlPicture: "",
        whatsappId
      });
    }

    if (updateImage) {
      try {
        const filename = await downloadProfileImage({
          profilePicUrl,
          companyId,
          contact
        });

        const urlPicture = filename === "nopicture.png" 
      ? `${process.env.FRONTEND_URL}/nopicture.png`
      : filename;

        await contact.update({
          urlPicture: filename,
          pictureUpdated: true
        });

        await contact.reload();
      } catch (error) {
        logger.error("Error downloading profile image:", error);
        Sentry.captureException(error);
        
        await contact.update({
          urlPicture: `${process.env.FRONTEND_URL}/nopicture.png`,
          pictureUpdated: true
        });
      }
    } else if (['facebook', 'instagram'].includes(channel)) {
      try {
        const filename = await downloadProfileImage({
          profilePicUrl,
          companyId,
          contact
        });

        const urlPicture = filename === "nopicture.png" 
      ? `${process.env.FRONTEND_URL}/nopicture.png`
      : filename;

        await contact.update({
          urlPicture: filename,
          pictureUpdated: true
        });

        await contact.reload();
      } catch (error) {
        logger.error("Error downloading social media profile image:", error);
        Sentry.captureException(error);
        
        await contact.update({
          urlPicture: `${process.env.FRONTEND_URL}/nopicture.png`,
          pictureUpdated: true
        });
      }
    }

    if (createContact) {
      io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
          action: "create",
          contact
        });
    } else {
      io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
          action: "update",
          contact
        });
    }

    return contact;
  } catch (err) {
    logger.error("Error to find or create a contact:", err);
    Sentry.captureException(err);
    throw err;
  }
};

export default CreateOrUpdateContactService;
