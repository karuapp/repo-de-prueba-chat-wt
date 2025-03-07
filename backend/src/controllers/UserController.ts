import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import SimpleListService from "../services/UserServices/SimpleListService";

import { SendMail } from "../helpers/SendMail";

import Setting from "../models/Setting";

import FindUserByEmailService from "../services/UserServices/FindUserByEmailService";
import UpdatePasswordUserService from "../services/UserServices/UpdatePasswordUserService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type ListQueryParams = {
  companyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    companyId,
    profile
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    email,
    password,
    name,
    profile,
    queueIds,
    whatsappId
  } = req.body;
  let userCompanyId: number | null = null;
  const { companyId } = req.user;

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    companyId,
    queueIds,
    whatsappId
  });

  const io = getIO();
  io.emit(`company-${userCompanyId}-user`, {
    action: "create",
    user
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;

  const user = await ShowUserService(userId);

  return res.status(200).json(user);
};

export const showMe = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;

  const user = await ShowUserService(id);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { id: requestUserId, companyId } = req.user;
  const { userId } = req.params;
  const userData = req.body;

  //console.log(req.body);
  //console.log(req.user);
  //console.log(userId);

  //console.log("xxx");

  if (req.user.profile !== "admin" && req.user.id != userId) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await UpdateUserService({
    userData,
    userId,
    companyId,
    requestUserId: +requestUserId
  });



  const io = getIO();
  io.emit(`company-${companyId}-user`, {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteUserService(userId, companyId);

  const io = getIO();
  io.emit(`company-${companyId}-user`, {
    action: "delete",
    userId
  });

  return res.status(200).json({ message: "User deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.query;
  const { companyId: userCompanyId } = req.user;

  const users = await SimpleListService({
    companyId: companyId ? +companyId : userCompanyId
  });

  return res.status(200).json(users);
};

export const findByEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  const user = await FindUserByEmailService(email);

  return res.status(200).json(user);
}

const gerarToken = () => {
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += Math.floor(Math.random() * 10);
  }
  return token;
}

export const sendEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;
  const token = gerarToken();

  let responseReq = null;
  let sendgridapi = null;
  let emailsender = null;

  try {

    const buscacompanyId = 1;

    const getapi = await Setting.findOne({
      where: { companyId: buscacompanyId, key: "sendgridapi" },
    });
    sendgridapi = getapi?.value;

    const getmail = await Setting.findOne({
      where: { companyId: buscacompanyId, key: "emailsender" },
    });
    emailsender = getmail?.value;

  } catch (error) {
    console.error("Error retrieving settings:", error);
  }

  if (!sendgridapi) {
    if (!emailsender) {
      return res.status(500).json({ message: "Missing sendgridapi or emailsender settings" });
    }
  }

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(sendgridapi);

  const mensagem = {
    to: `${email}`,
    from: `${process.env.MAIL_FROM} <${emailsender}>`,
    bcc: `${emailsender}`,
    subject: 'Alteração de Senha',
    text: `Token para redefinição de senha: ${token}`,
    html: `<div style="background-color: #f7f7f7; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <p><strong>Token para redefinição de senha:</strong></p>
    <p style="font-size: 26px;"><strong>${token}</strong></p>
  </div>`,
  }

  if (sendgridapi) {

    sgMail.send(mensagem)
      .then((response: any) => {
        console.log("Envio Email: ", response);
        responseReq = response
      })
      .catch((err: any) => console.log(err));
  } else if (emailsender) {

    SendMail(mensagem)
      .then((response: any) => {
        console.log("Envio Email: ", response);
        responseReq = response
      })
      .catch((err: any) => console.log(err));

  } else {
    return res.status(500).json({ message: "Missing sendgridapi or emailsender settings" });
  }



  return res.status(200).json({
    responseReq: responseReq,
    token: token
  });
}

export const updatePasswordUser = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;
  const { password } = req.body;

  const user = await UpdatePasswordUserService(email, password);

  if (user === null) {
    new AppError("Not Update");
  }

  return res.status(200).json(user);
}
