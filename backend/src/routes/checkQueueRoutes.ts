import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as CheckQueueController from "../controllers/CheckQueueController";

const checkQueueRoutes = Router();

// checkQueueRoutes.get("/checkqueue/:queueId", isAuth, CheckQueueController.show);

export default checkQueueRoutes;
