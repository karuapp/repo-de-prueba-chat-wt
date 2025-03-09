import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";

type HeaderParams = {
  Bearer: string;
};

const tokenAuthInternal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const token = req.headers.authorization.replace('Bearer ', '');
    if (token === "31080209") {
		return next();
    } else {
      throw new AppError(
      	"Acesso não permitido",
      	401
    	);
      }
  
    return next();
};

export default tokenAuthInternal;
