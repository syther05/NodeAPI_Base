import dbIndex from '../data-model/index.js';
const db = dbIndex.database;

const update_object = (dbObj = null, input) => {
   return new Promise(async (resolve, reject) => {
      try {
         const item = {};
         for (const key in input) {
            if (Object.hasOwnProperty.call(input, key)) {
               item[key] = input[key];
            }
         }

         dbObj.create(item).then((result) => {
            resolve(result);
         }).catch((error) => {
            resolve(error);
         });
      } catch (error) {
         resolve(error);
      }
   });
}

const update_object_byID = (dbObj = null, pKey = null, input) => {
   return new Promise((resolve, reject) => {
      dbObj.findByPk(pKey).then((item) => {
         if (item != null) {
            for (const key in input) {
               if (Object.hasOwnProperty.call(input, key)) {
                  item[key] = input[key];
               }
            }
            if (item.changed()) {
               item.save().then((res) => {
                  resolve(item);
               }).catch((error) => {
                  resolve(error);
               });
            } else {
               resolve(item);
            }
         } else {
            resolve(item);
         }
      });
   });
}

const update_object_byMultiID = (dbObj = null, pKeyList = null, input) => {
   return new Promise((resolve, reject) => {
      dbObj.findOne({ where: pKeyList }).then((item) => {
         if (item != null) {
            for (const key in input) {
               if (Object.hasOwnProperty.call(input, key)) {
                  item[key] = input[key];
               }
            }
            if (item.changed()) {
               item.save().then((res) => {
                  resolve(item);
               }).catch((error) => {
                  resolve(error);
               });
            } else {
               resolve(item);
            }
         } else {
            resolve(item);
         }
      });
   });
}

const delete_object_byID = (dbObj = null, pKey = null) => {
   return new Promise((resolve, reject) => {
      dbObj.findByPk(pKey).then(async (item) => {
         if (item !== null) {
            item.destroy().then((res) => {
               resolve({ Result: true });
            }).catch((Err) => {
               console.error('Error delete_object_byID - destroy:', Err);
               resolve(Err);
            })
         } else {
            resolve({ Result: false });
         }
      }).catch((Err) => {
         console.error('Error delete_object_byID - findByPk:', Err);
         resolve(Err);
      });
   });
}

const delete_object_byMultiID = (dbObj = null, pKeyList = null) => {
   return new Promise((resolve, reject) => {
      dbObj.findOne({ where: pKeyList }).then((item) => {
         if (item) {
            item.destroy().then((res) => {
               resolve({ Result: true });
            }).catch((Err) => {
               console.error('Error delete_object_byID - destroy:', Err);
               resolve(Err);
            })
         } else {
            resolve({ Result: false });
         }
      }).catch((Err) => {
         console.error('Error delete_object_byID - findByPk:', Err);
         resolve(Err);
      });
   });
}



const resolvers = {
   Query: {
      // Users: async () => db.models.User.findAll({ include: db.models.UserGroup }),
   },

   Mutation: {
      // createDispatchPlan: async (obj, args, context, info) => update_object(db.models.DispatchPlan, args.input),
      // updateDispatchPlan: async (obj, args, context, info) => update_object_byID(db.models.DispatchPlan, args.DispatchPlanID, args.input),
      // deleteDispatchPlan: async (obj, args, context, info) => delete_object_byID(db.models.DispatchPlan, args.DispatchPlanID),
   },

   Subscription: {
      // hello: {
      //    subscribe: async function* () {
      //       while (is_alive_test()) {
      //          const test = await check_change();
      //          console.log('Sending: ', test);
      //          yield { hello: test };
      //       }
      //    },
      // },
   }
};


export default resolvers;