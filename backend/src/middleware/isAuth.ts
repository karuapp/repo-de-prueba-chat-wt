import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import User from "../models/User";
import Queue from "../models/Queue";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId } = decoded as TokenPayload;

    let user;
    
    if (id && id !== "undefined" && id !== "null") {
      user =  await User.findByPk(id, { include: [Queue] });
        if (user) {
          user.online = true;
          await user.save();
        } else {
          logger.info(`onConnect: User ${user?.name} not found`);
        }
      } else {
        logger.info("onConnect: Missing userId");
      }  
      

    req.user = {
      id,
      profile,
      companyId
    };
  } catch (err) {
    throw new AppError("Expired Session - New token generated!", 403 );
  }

  return next();
};

export default isAuth;
