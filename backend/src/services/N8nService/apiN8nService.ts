import AppError from "../../errors/AppError";
import axios, { AxiosInstance } from "axios";
import Setting from "../../models/Setting";


// Service Api N8n version 1.0.0

export const listWorkFlow = async (companyId) => {

  const SettingApiKeyN8N = await Setting.findOne({
    where: {
      key: "apiKeyN8N",
      companyId
    }
  });

  const SettingUrlN8N = await Setting.findOne({
    where: {
      key: "urlN8N",
      companyId
    }
  });


  var ApiKeyN8N = SettingApiKeyN8N.value
  var urlN8N = SettingUrlN8N.value

  const options = {
    method: 'GET',
    url: `${urlN8N}`,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': `${ApiKeyN8N}`
    }
  };

  try {
    // @ts-ignore
    const request = await axios.get(`${urlN8N}/api/v1/workflows`, options);
    return request.data

  } catch (error) {

  }
}
export const getN8N = async (companyId, n8nId) => {

  const SettingApiKeyN8N = await Setting.findOne({
    where: {
      key: "apiKeyN8N",
      companyId
    }
  });
  const SettingUrlN8N = await Setting.findOne({
    where: {
      key: "urlN8N",
      companyId
    }
  });

  var ApiKeyN8N = SettingApiKeyN8N.value
  var urlN8N = SettingUrlN8N.value

  const options = {
    method: 'GET',
    url: `${urlN8N}`,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': `${ApiKeyN8N}`
    }
  };

  try {
    // @ts-ignore

    const request = await axios.get(`${urlN8N}/api/v1/workflows/${n8nId}`, options);
    const idWebHook = request.data.nodes.map(item => item.id)
    let n8n = `${urlN8N}/webhook/${idWebHook}`
    return n8n
  } catch (error) {
    return null
  }
}
export const N8nService = {
  listWorkFlow,
  getN8N
};
