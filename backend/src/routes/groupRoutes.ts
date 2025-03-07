import express from "express";
import isAuth from "../middleware/isAuth";

import * as GroupController from "../controllers/GroupController";

const groupRoutes = express.Router();

groupRoutes.get("/groups", isAuth, GroupController.index);
groupRoutes.get("/listMembersgroup/:contactNumber/:whatsappId", isAuth, GroupController.getMembersGroup);
groupRoutes.post("/creatGroupAndTicket", isAuth, GroupController.storeGroupAndTicket);
groupRoutes.put("/removeMemberGroup", isAuth, GroupController.removeMemberGroup);

export default groupRoutes;
