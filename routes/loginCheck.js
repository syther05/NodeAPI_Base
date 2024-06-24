import express from 'express';
const router = express.Router();

import dbIndex from "../data-model/index.js";
const db = dbIndex.database;

router.post("/", async (req, res) => {
   try {
      if (req.user.system_admin === true) {
         const groupCheck = await db.models.UserGroup.findAll();
         const user_data = {
            groups: groupCheck !== null ?groupCheck:[]
         };
         res.json({ message: "Logged In", user_data: user_data });
      } else {
         const groupCheck = await db.models.User.findOne({ where: { user_id: req.user.user_id }, include: db.models.UserGroup });
         const user_data = {
            groups: groupCheck !== null ?groupCheck.UserGroups:[]
         };
         res.json({ message: "Logged In", user_data: user_data });
      }
   } catch (error) {
      res.json({ message: "Logged In" });
   }
});

export default router 