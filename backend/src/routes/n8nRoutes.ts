import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as N8nController from "../controllers/N8nController";

const n8nRoutes = Router();

n8nRoutes.get("/listworkFlow", isAuth, N8nController.listWrkFlow);

export default n8nRoutes;