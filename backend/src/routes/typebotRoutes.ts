import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as TypebotController from "../controllers/TypebotController";

const typebotRoutes = Router();

typebotRoutes.get("/listworkspaces", isAuth, TypebotController.listWrkspace);

typebotRoutes.get("/listtypebots", isAuth, TypebotController.listTypebots);


export default typebotRoutes;
