import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import tokenAuth from "../middleware/tokenAuth";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);
messageRoutes.get("/messages-ghost/:ticketId", isAuth, MessageController.ghost);
messageRoutes.post("/messages/:ticketId", isAuth, upload.array("medias"), MessageController.store);
messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);
messageRoutes.post("/api/messages/send", tokenAuth, upload.array("medias"), MessageController.send);
messageRoutes.post("/api/messages/update",tokenAuth,MessageController.apiupdateticket);
messageRoutes.post("/api/messages/finish",tokenAuth,MessageController.apifinishticket);
messageRoutes.post("/api/messages/:ticketId",tokenAuth,MessageController.chamaai);
messageRoutes.post("/messages/edit/:messageId", isAuth, MessageController.edit);


export default messageRoutes;
