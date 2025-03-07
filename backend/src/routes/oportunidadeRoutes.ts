import express from "express";
import isAuth from "../middleware/isAuth";

import * as OportunidadesController from "../controllers/OportunidadesController";

const oportunidadeRoutes = express.Router();

oportunidadeRoutes.get("/oportunidade/list", isAuth, OportunidadesController.list);
oportunidadeRoutes.get("/oportunidade", isAuth, OportunidadesController.index);
oportunidadeRoutes.post("/oportunidade", isAuth, OportunidadesController.store);
oportunidadeRoutes.put("/oportunidade/:ratingId", isAuth, OportunidadesController.update);
oportunidadeRoutes.get("/oportunidade/:ratingId", isAuth, OportunidadesController.show);
oportunidadeRoutes.delete("/oportunidade/:ratingId", isAuth, OportunidadesController.remove);
oportunidadeRoutes.delete("/oportunidade", isAuth, OportunidadesController.removeAll);


export default oportunidadeRoutes;
