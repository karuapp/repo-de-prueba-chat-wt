import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SettingController from "../controllers/SettingController";
import multer from "multer";
import uploadConfig from "../config/uploadlogo";
import uploadCertConfig from "../config/uploadcertificado";
import uploadDocConfig from "../config/uploaddoc";
const upload = multer(uploadConfig);
const uploadCert = multer(uploadCertConfig);
const uploadDoc = multer(uploadDocConfig);

const settingRoutes = Router();

settingRoutes.get("/settings", isAuth, SettingController.index);

settingRoutes.get("/settings/:settingKey", SettingController.show);

settingRoutes.put("/settings/:settingKey", isAuth, SettingController.update);

settingRoutes.post(
  "/settings/media-upload",
  isAuth,
  upload.array("file"),
  SettingController.mediaUpload
);

settingRoutes.post(
  "/settings/cert-upload",
  isAuth,
  uploadCert.array("file"),
  SettingController.certUpload
);

settingRoutes.post(
  "/settings/doc-upload",
  isAuth,
  uploadDoc.array("file"),
  SettingController.docUpload
);

export default settingRoutes;
