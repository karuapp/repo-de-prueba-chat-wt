import { Router } from "express";
import isAuth from "../middleware/isAuth";
import tokenAuth from "../middleware/tokenAuth";


import * as ApiTransferTicket from "../controllers/ApiTransferTicket"

const transferTicketRoutes = Router();

transferTicketRoutes.put("/transferTicket-to-queue", tokenAuth,ApiTransferTicket.transferTicket)

transferTicketRoutes.put("/Search-the-queue-by-text", tokenAuth,ApiTransferTicket.trasferTicketFilterText)



export default transferTicketRoutes;
