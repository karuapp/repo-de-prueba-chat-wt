import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";
import Setting from "./models/Setting"; // Assuming this is where you've defined your Setting model


Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();


app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
//app.use("/public", express.static(uploadConfig.directory));
//app.use("/public", [isAuth, express.static(uploadConfig.directory)]);

const checkExternalDownload = async () => {
  try {
    const setting = await Setting.findOne({
      where: {
        key: "externaldownload",
        companyId: 1
      }
    });

    //console.log(setting);

    if (setting && setting.value === "enabled") {
      //console.log("External download allowed");
      return true;
    } else {
      //console.log("External download not allowed");
      return false;
    }
  } catch (error) {
    //console.error("Error fetching setting:", error);
    // Handle errors, such as database connection issues or query errors
    return false;
  }
};


app.use('/public', async (req, res, next) => {
  const referer = req.headers.referer;
  const frontendUrl = process.env.FRONTEND_URL + '/';
  const reqbaseUrl = req.baseUrl;

  //console.log(req.originalUrl);

  //console.log(referer);
  //console.log(reqbaseUrl);

  if(req.originalUrl === "/public/legal/termos.pdf"){
    next();
  } else if(req.originalUrl === "/public/legal/privacidade.pdf"){
    next();
  } else if (referer === frontendUrl) {
    next(); // Allow access to /public
  } else if(reqbaseUrl === '/public'){
    
    
    const isExternalDownloadAllowed = await checkExternalDownload();
    
    //console.log(isExternalDownloadAllowed);

    if (isExternalDownloadAllowed) {
      console.log("External download is allowed");
      next();
    } else {
      console.log("External download is not allowed");
      return res.status(500).json({ error: "External download not allowed" });
    } 

  		
    	//console.log('Oh no... Oh no... Oh no no no no no');
    	//return res.status(500).json({ error: "Oh no... Oh no... Oh no no no no no" });
    
    }else{
    	next();
    }
  
}, express.static(uploadConfig.directory));




app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Sessão Expirada! Recarregue sua página." });
});

export default app;
