import dotenv from "dotenv";
import { Strategy, ExtractJwt } from "passport-jwt";
import { users } from './routes/auth.js'
import passport from 'passport';
import dbIndex from "./data-model/index.js";
const db = dbIndex.database;


dotenv.config();

const opts = {
   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
   secretOrKey: process.env.JWT_SECRET
};

const passportCfg = passport => {
   passport.use(
      new Strategy(opts, async (jwt_payload, done) => {
         // console.log('jwt_payload: ', jwt_payload)
         const user = users.find(u => u.username === jwt_payload.username);
         if (user) {
            user.system_admin = true
            return done(null, user);
         }
         const userCheck = await db.models.User.findOne({ where: { userEmail: jwt_payload.username } });
         if (userCheck) {
            return done(null, userCheck);
         }
         return done(null, false);
      })
   );
};

export { passport, passportCfg };
export default passportCfg;