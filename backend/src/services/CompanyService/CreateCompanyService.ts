import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import Setting from "../../models/Setting";

interface CompanyData {
  name: string;
  phone?: string;
  namecomplete?: string;
  pais?: string;
  indicator?: string;
  email?: string;
  password?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    namecomplete,
    pais,
    indicator,
    email,
    status,
    planId,
    password,
    campaignsEnabled,
    dueDate,
    recurrence
  } = companyData;

/*
  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_COMPANY_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameName = await Company.findOne({
              where: { name: value }
            });

            return !companyWithSameName;
          }
          return false;
        }
      )
  });
  
*/

const companySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "ERR_COMPANY_INVALID_NAME")
    .required("ERR_COMPANY_INVALID_NAME")
    .test(
      "Check-unique-name",
      "Empresa Já Cadastrada!",
      async value => {
        if (value) {
          const companyWithSameName = await Company.findOne({
            where: { name: value }
          });

          return !companyWithSameName;
        }
        return false;
      }
    ),
  email: Yup.string()
    .email("ERR_COMPANY_INVALID_EMAIL")
    .required("ERR_COMPANY_INVALID_EMAIL")
    .test(
      "Check-unique-email",
      "E-Mail Já Cadastrado!",
      async value => {
        if (value) {
          const companyWithSameEmail = await Company.findOne({
            where: { email: value }
          });

          return !companyWithSameEmail;
        }
        return false;
      }
    )
});

  try {
    await companySchema.validate({ name, email });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const company = await Company.create({
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

  const user = await User.create({
    name: company.namecomplete,
    email: company.email,
    password: companyData.password,
    profile: "admin",
    companyId: company.id
  });

  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "asaas"
    },
    defaults: {
      companyId: company.id,
      key: "asaas",
      value: ""
    },
  });

  //tokenixc
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "tokenixc"
    },
    defaults: {
      companyId: company.id,
      key: "tokenixc",
      value: ""
    },
  });

  //ipixc
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "ipixc"
    },
    defaults: {
      companyId: company.id,
      key: "ipixc",
      value: ""
    },
  });

  //ipmkauth
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "ipmkauth"
    },
    defaults: {
      companyId: company.id,
      key: "ipmkauth",
      value: ""
    },
  });

  //clientsecretmkauth
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "clientsecretmkauth"
    },
    defaults: {
      companyId: company.id,
      key: "clientsecretmkauth",
      value: ""
    },
  });

  //clientidmkauth
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "clientidmkauth"
    },
    defaults: {
      companyId: company.id,
      key: "clientidmkauth",
      value: ""
    },
  });

  //CheckMsgIsGroup
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "CheckMsgIsGroup"
    },
    defaults: {
      companyId: company.id,
      key: "enabled",
      value: ""
    },
  });

  //CheckMsgIsGroup
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: ""
    },
    defaults: {
      companyId: company.id,
      key: "call",
      value: "disabled"
    },
  });

  //scheduleType
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "scheduleType"
    },
    defaults: {
      companyId: company.id,
      key: "scheduleType",
      value: "disabled"
    },
  });

  //userRating
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "userRating"
    },
    defaults: {
      companyId: company.id,
      key: "userRating",
      value: "disabled"
    },
  });

  //chatBotType
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "chatBotType"
    },
    defaults: {
      companyId: company.id,
      key: "chatBotType",
      value: "text"
    },
  });

  //moveQueue
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "moveQueue"
    },
    defaults: {
      companyId: company.id,
      key: "moveQueue",
      value: "disabled"
    },
  });

  //idfila
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "idfila"
    },
    defaults: {
      companyId: company.id,
      key: "idfila",
      value: "0"
    },
  });

  //tempofila
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "tempofila"
    },
    defaults: {
      companyId: company.id,
      key: "tempofila",
      value: "10"
    },
  });

  //sendGreetingAccepted
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "sendGreetingAccepted"
    },
    defaults: {
      companyId: company.id,
      key: "sendGreetingAccepted",
      value: "enabled"
    },
  });

  //outsidemessage
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "outsidemessage"
    },
    defaults: {
      companyId: company.id,
      key: "outsidemessage",
      value: "enabled"
    },
  });

  //outsidequeue
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "outsidequeue"
    },
    defaults: {
      companyId: company.id,
      key: "outsidequeue",
      value: "disabled"
    },
  });

  //sendTransferAlert
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "sendTransferAlert"
    },
    defaults: {
      companyId: company.id,
      key: "sendTransferAlert",
      value: "enabled"
    },
  });

  //mainColor
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "mainColor"
    },
    defaults: {
      companyId: company.id,
      key: "mainColor",
      value: "#4a90e2"
    },
  });

  //scrollbarColor
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "scrollbarColor"
    },
    defaults: {
      companyId: company.id,
      key: "scrollbarColor",
      value: "#4a90e2"
    },
  });

  //toolbarBackground
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "toolbarBackground"
    },
    defaults: {
      companyId: company.id,
      key: "toolbarBackground",
      value: "#4a90e2"
    },
  });

  //backgroundPages
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "backgroundPages"
    },
    defaults: {
      companyId: company.id,
      key: "backgroundPages",
      value: "linear-gradient(to right, #3c6afb , #3c6afb , #C5AEF2)"
    },
  });

  if (companyData.campaignsEnabled !== undefined) {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: "false"
      },

    });
    if (!created) {
      await setting.update({ value: "false" });
    }
  }

  return company;
};

export default CreateCompanyService;