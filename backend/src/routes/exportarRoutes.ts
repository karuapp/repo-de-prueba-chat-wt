import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";

import * as ExportarController from "../controllers/ExportarController";

const exportarRoutes = express.Router();


exportarRoutes.get("/exportar/baixar", isAuth, ExportarController.baixar);



export default exportarRoutes;
