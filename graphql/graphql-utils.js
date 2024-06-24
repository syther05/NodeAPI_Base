

const sync_is_alive = (passed_id) => {
   let result = false;
   let my_id = '';
   
   // console.log('sync_lookup_is_alive - ', subIDs);
   // console.log('passed_id: ', passed_id);

   if (passed_id != null) {
      my_id = passed_id;
      let currentLink = subIDs.filter(item => item.id == passed_id);
      if (currentLink.length == 1) {
         result = true;
      }
   } else {
      let newLinks = subIDs.filter(item => item.state == null);
      if (newLinks.length > 0) {
         if (newLinks[0].state == null) {
            newLinks[0].state = 1;
            my_id = newLinks[0].id;
            result = true;
         }
      }
   }
   return {result, my_id};
}





export { sync_is_alive };

