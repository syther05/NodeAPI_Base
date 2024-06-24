import db from './dbConfig.js';

import User from './Class/Users.js';


const init = () => {
   return new Promise((resolve, reject) => {
      db.authenticate().then((err) => {
         console.log('Connection to DB successful');
         if (typeof err !== 'undefined') {
            console.log('ERROR: ', err)
         }
         
         // const syncOptions = { alter: true };
         // const syncOptions = { force: true };
         const syncOptions = {};

         db.sync(syncOptions).then((result) => {
            // console.log('>>>>>>>>> DB Sync result: ', result);
            load_static_data(db);
            resolve(true);
         }).catch((err) => {
            reject("DB Sync Error: "+err);
         });
      }).catch((err) => {
         console.error('Unable to connect to database', err);
         reject("DB authenticate Error: "+err);
      });
   });
}

const dbIndex = {
   database: db,
   init: init
}

export default dbIndex;