import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import Invoices from "../../models/Invoices";
import Plan from "../../models/Plan";
import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "../WbotServices/StartWhatsAppSession";
import * as Sentry from "@sentry/node";

interface CompanyData {
  name: string;
  id?: number | string;
  phone?: string;
  namecomplete?: string;
  pais?: string;
  indicator?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
}

const UpdateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const company = await Company.findByPk(companyData.id);
  const {
    name,
    phone,
    namecomplete,
    pais,
    indicator,
    email,
    status,
    planId,
    campaignsEnabled,
    dueDate,
    recurrence
  } = companyData;

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  const openInvoices = await Invoices.findAll({
     where: {
       status: "open",
       companyId: company.id,
     },
  });

  if (openInvoices.length > 1) {
    for (const invoice of openInvoices.slice(1)) {
      await invoice.update({ status: "cancelled" });
    }
  }

  const plan = await Plan.findByPk(planId);
  
  if (!plan) {
    throw new Error("Plano Não Encontrado.");
  }

  // 5. Atualizar a única invoice com status "open" existente, baseada no companyId.
  const openInvoice = openInvoices[0];
  
  if (openInvoice) {
    await openInvoice.update({
      value: plan.value,
      detail: plan.name,
      dueDate: dueDate,
    });
  
  } else {
    throw new Error("Nenhuma fatura em aberto para este cliente!");
  }

  await company.update({
    name,
    phone,
    namecomplete,
    pais,
    indicator,
    email,
    status,
    planId,
    dueDate,
    recurrence
  });

  try {
  
    const companyId = company.id
    const whatsapps = await ListWhatsAppsService({ companyId: company.id });
    if (whatsapps.length > 0) {
      whatsapps.forEach(whatsapp => {
        StartWhatsAppSession(whatsapp, companyId);
      });
    }
  } catch (e) {
    Sentry.captureException(e);
  }

  if (companyData.campaignsEnabled !== undefined) {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: `${campaignsEnabled}`
      }
    });
    if (!created) {
      await setting.update({ value: `${campaignsEnabled}` });
    }
  }

  return company;
};

export default UpdateCompanyService;