import AppError from "../../errors/AppError";
import axios, { AxiosInstance } from "axios";
import Setting from "../../models/Setting";

const URLTYPEBOTBUILDER = process.env.TYPEBOT_BUILDER_URL
const URLTYPEBOTVIEWER = process.env.TYPEBOT_VIEWER_URL

// Service Api Typebot version 2.20.0

const apiBuilder = async (companyId): Promise<AxiosInstance> => { 
    
  const SettingtokenTypebot = await Setting.findOne({
    where: {
      key: "tokenTypebot",
      companyId
     }
  });
  const SettingURLTypebot = await Setting.findOne({
    where: {
      key: "urlTypebot",
      companyId
     }
  });

  
  // var tokenTypebot = "UhsQx2ZNHMcCm2u6eOQ2rbt4"
  var tokenTypebot = SettingtokenTypebot.value
  var urlTypeBot = SettingURLTypebot.value

  return axios.create({
    baseURL: urlTypeBot,
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${tokenTypebot}`,
      Accept: "application/json"
    }
  })
}

const apiViewer = async (companyId): Promise<AxiosInstance> => { 

  const SettingURLBotTypebot = await Setting.findOne({
    where: {
      key: "urlBotTypebot",
      companyId
     }
  });
  var urlBotTypeBot = SettingURLBotTypebot.value

    return axios.create({
      baseURL: urlBotTypeBot,
      headers: {
        Accept: "application/json"
      }
    });
}

export const startChat = async (msgBody, typebot, ticket, companyId) => {
  console.log(JSON.stringify(ticket));
  const reqData = {
    message: msgBody,
    "prefilledVariables": {
      "contactName": ticket.contact.name,
      "contactNumber": ticket.contact.number,
      "ticketId": ticket.id,
      "whatsappId": ticket.whatsappId,
    },
  };
  const SettingURLBotTypebot = await Setting.findOne({
    where: {
      key: "urlBotTypebot",
      companyId
     }
  });
  var urlBotTypeBot = SettingURLBotTypebot.value
  const api = await apiViewer(companyId);
  try {
    const request = await api.post(`${urlBotTypeBot}/api/v1/typebots/${typebot}/startChat`, reqData);
    return request.data
  } catch (error) {
    
  } 
}

export const continueChat = async (msgBody, sessiontypebot, companyId) => {
  const reqData = {
    message: msgBody
  };
  const SettingURLBotTypebot = await Setting.findOne({
    where: {
      key: "urlBotTypebot",
      companyId
     }
  });
  var urlBotTypeBot = SettingURLBotTypebot.value
  const api = await apiViewer(companyId);
  try {
    const request = await api.post(`${urlBotTypeBot}/api/v1/sessions/${sessiontypebot}/continueChat`, reqData);
    return request.data
    
  } catch (error) {
    
  } 
}  

export const listWorkspace = async (companyId) => {
  const api = await apiBuilder(companyId);
  try {
    const request = await api.get(`/api/v1/workspaces`);
    return request.data
    
  } catch (error) {
    
  } 
}

export const listTypebots = async (companyId, workspaceId) => {
  const api = await apiBuilder(companyId)
  try {
    const request = await api.get(`/api/v1/typebots`, {
      params: {
        workspaceId: workspaceId
      }
    });
    return request.data
    
  } catch (error) {
    throw new AppError("ERR_TYPEBOTS_NOT",403)
  } 
}

export const getTypebot = async (companyId, typebotId) => {
  const api = await apiBuilder(companyId)
  try {
    const request = await api.get(`/api/v1/typebots/${typebotId}`);
    return request.data
  } catch (error) {
      return null
  } 
}

export const TypebotService = {
  startChat,
  continueChat,
  listWorkspace,
  listTypebots,
  getTypebot
};

//export default ApiTypebotService;
