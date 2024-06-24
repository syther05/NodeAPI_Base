import dotenv from "dotenv";
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
const router = express.Router();
dotenv.config();


import dbIndex from "../data-model/index.js";
const db = dbIndex.database;


const TOKEN_EXPIRY = "5d";
const users = [];

if (typeof process.env.ADMIN_USERNAME == 'string' && typeof process.env.ADMIN_PASSWORD == 'string') {
   users.push({
      user_type: 'admin',
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
   });
}

if (process.env.USER_REGISTRATION == 'true') {
   router.post("/register", async (req, res) => {
      try {
         const {
            firstName,
            lastName,
            userEmail,
            userPassword,
            userGroups,
         } = req.body;
         const hashedPassword = await bcrypt.hash(userPassword, 10);
         const userObj = {
            firstName: firstName,
            lastName: lastName,
            userEmail: userEmail.trim().toLocaleLowerCase(),
            userPassword: hashedPassword,
         }
         db.models.User.create(userObj).then((result) => {
            result.setUserGroups(userGroups);
            res.status(201).json({ message: "User registered successfully" });
         }).catch((error) => {
            if (typeof error.errors !== 'undefined') {
               for (let a = 0; a < error.errors.length; a++) {
                  res.status(201).json({ message: "Value already in use", value: error.errors[a].value });
                  return;
               }
            }
            res.status(201).json({ message: "Register Error" });
         });
      } catch (e) {
         console.log(e.message);
         res.status(201).json({ message: "Register Error" });
      }
   });
   router.post("/register_update", async (req, res) => {
      try {
         const {
            userEmail,
            firstName,
            lastName,
            userGroups
         } = req.body;
         const userObj = {
            firstName: firstName,
            lastName: lastName,
            userEmail: userEmail.trim().toLocaleLowerCase(),
         }
         const findUser = await db.models.User.findOne({ 
            where: { userEmail: userObj.userEmail }, 
            include: [{ model: db.models.UserGroup }] 
         });
         if (findUser !== null) {
            findUser.setUserGroups(userGroups);
            findUser.firstName = userObj.firstName;
            findUser.lastName = userObj.lastName;
            findUser.save().then((result) => {
               if (result) {
                  res.status(201).json({ message: "User updated successfully" });
               } else {
                  res.status(201).json({ message: "Register Error" });
               }
            });
         } else {
            res.status(201).json({ message: "Register Error" });
         }
      } catch (e) {
         console.log('Error: ', e);
         res.status(201).json({ message: "Register Error" });
      }
   });
   router.post("/register_delete", async (req, res) => {
      try {
         const {
            userEmail,
         } = req.body;
         const findUser = await db.models.User.findOne({ where: { userEmail: userEmail.trim().toLocaleLowerCase() } });
          if (findUser !== null) {
            findUser.destroy().then((result) => {
               if (result) {
                  res.status(201).json({ message: "User deleted successfully" });
               } else {
                  res.status(201).json({ message: "Register Error" });
               }
            });
         } else {
            res.status(201).json({ message: "Register Error" });
         }
      } catch (e) {
         console.log(e.message);
         res.status(201).json({ message: "Register Error" });
      }
   });
   router.post("/password_update", async (req, res) => {
      try {
         const {
            userPassword,
            userEmail,
         } = req.body;
         const hashedPassword = await bcrypt.hash(userPassword, 10);
         const findUser = await db.models.User.findOne({ where: { userEmail: userEmail.trim().toLocaleLowerCase() } });
         if (findUser !== null) {
            findUser.userPassword = hashedPassword;
            findUser.save().then((result) => {
               if (result) {
                  res.status(201).json({ message: "Password updated successfully" });
               } else {
                  res.status(201).json({ message: "Register Error" });
               }
            });
         } else {
            res.status(201).json({ message: "Register Error" });
         }
      } catch (e) {
         console.log(e.message);
         res.status(201).json({ message: "Register Error" });
      }
   });
}






router.post("/login", async (req, res) => {
   try {
      const { username, password, deviceID } = req.body;
      const refreshToken = crypto.randomBytes(64).toString('hex');
      // const hashedPassword = await bcrypt.hash(password, 10);
      // console.log('>>> LOGIN <<<');
      // console.log('username: ', username);
      // console.log('password: ', password);
      // // console.log('hashedPassword: ', hashedPassword);
      // console.log('deviceID: ', deviceID);

      if (typeof process.env.ADMIN_USERNAME == 'string' && typeof process.env.ADMIN_PASSWORD == 'string') {
         if (process.env.ADMIN_USERNAME === username) {
            const user = users.find((u) => u.username === username);
            if (typeof user == 'object') {
               const superAdmin_Test = await bcrypt.compare(password, user.password);
               if (superAdmin_Test === true) {
                  user.refreshToken = refreshToken;
                  const token = jwt.sign(
                     { username: user.username },
                     process.env.JWT_SECRET,
                     {
                        expiresIn: "1h",
                     }
                  );

                  const groupCheck = await db.models.UserGroup.findAll();

                  console.log('groupCheck: ', groupCheck);

                  const user_data = {
                     groups: groupCheck !== null ?groupCheck[0]:[]
                  };
            
                  console.log('user_data: ', user_data);
                  

                  res.json({ message: "Logged in successfully", token, refreshToken, user_data });
                  return
               }
            }
         }
      }

      if (typeof deviceID === 'undefined') {
         return res.status(400).json({ message: "Invalid login, Update required" });
      }

      let userCheck = null;
      let passwordMatch = false;
      const deviceCheck = await db.models.UserAuthTokens.findOne({ where: { device_uuid: deviceID } });

      if (deviceCheck !== null) {
         userCheck = await db.models.User.findOne({ where: { user_id: deviceCheck.user_id, userEmail: username.trim().toLocaleLowerCase() } });
      }
      if (deviceCheck === null || userCheck === null) {

         console.log('username: -'+username+'-')
         console.log('username: ', username.trim())

         userCheck = await db.models.User.findOne({ where: { userEmail: username.trim().toLocaleLowerCase() } });



         if (!userCheck) {
            console.log('Auth Fail - User Name not Found');

            const test = await db.models.User.findAll();
            console.log('test: ', test);
            
            

            return res.status(400).json({ message: "Invalid username or password" });
         }
         passwordMatch = await bcrypt.compare(password, userCheck.userPassword);
         if (!passwordMatch) {
            console.log('Auth Fail - 2');
            return res.status(400).json({ message: "Invalid username or password" });
         }
         await db.models.UserAuthTokens.create({
            user_id: userCheck.user_id,
            device_uuid: deviceID,
            refresh_token: refreshToken,
         })
      } else {
         userCheck = await db.models.User.findOne({ where: { user_id: deviceCheck.user_id, userEmail: username.trim().toLocaleLowerCase() } });
         if (!userCheck) {
            console.log('Auth Fail - 3');
            return res.status(400).json({ message: "Invalid username or password" });
         }
         passwordMatch = await bcrypt.compare(password, userCheck.userPassword);
         if (!passwordMatch) {
            console.log('Auth Fail - 4');
            return res.status(400).json({ message: "Invalid username or password" });
         }
         deviceCheck.refresh_token = refreshToken;
         await deviceCheck.save();
      }
      const token = jwt.sign(
         {
            username: userCheck.userEmail.trim().toLocaleLowerCase(),
            deviceID: deviceID
         },
         process.env.JWT_SECRET,
         {
            expiresIn: TOKEN_EXPIRY,
         }
      );
      
      const groupCheck = await db.models.User.findOne({ where: { userEmail: username.trim().toLocaleLowerCase() }, include: db.models.UserGroup });
      const user_data = {
         groups: groupCheck !== null ?groupCheck.UserGroups:[]
      };



      res.json({ message: "Logged in successfully", token, refreshToken, user_data });
   } catch (e) {
      console.log('Login Error: ', e);
   }
});

router.post("/token", async (req, res) => {
   try {
      const { refreshToken, deviceID } = req.body;

      if (typeof deviceID === 'undefined' || typeof refreshToken === 'undefined') {
         return res.status(400).json({ message: "Invalid , Update required" });
      }

      const deviceCheck = await db.models.UserAuthTokens.findOne({ where: { device_uuid: deviceID, refresh_token: refreshToken } });
      if (!deviceCheck) {
         return res.status(403).json({ message: "Invalid refresh token" });
      }
      const userCheck = await db.models.User.findOne({ where: { user_id: deviceCheck.user_id } });
      if (!userCheck) {
         return res.status(403).json({ message: "Invalid refresh token" });
      }
      const newToken = jwt.sign(
         {
            username: userCheck.userEmail.trim().toLocaleLowerCase(),
            deviceID: deviceID
         },
         process.env.JWT_SECRET,
         { expiresIn: TOKEN_EXPIRY }
      );
      res.json({ message: "New access token generated", token: newToken });
   } catch (e) {
      console.log('Token Error: ', e);
   }
});

router.post("/logout", (req, res) => {
   // console.log('DEBUG ------ Login users: ', users);
   // console.log('req: ', req.body)
   const { refreshToken } = req.body;
   const user = users.find((u) => u.refreshToken === refreshToken);
   if (!user) {
      return res.status(400).json({ message: "Invalid refresh token" });
   }
   user.refreshToken = null;
   res.json({ message: "User logged out successfully" });
});


export { router, users };
export default router