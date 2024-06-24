const Sleep = (seconds) => {
   return new Promise((resolve) => {
      console.log('Sleeping for ' + seconds + ' mls');
      setTimeout(function () {
         resolve(true);
      }, seconds);
   });
}


export { Sleep }
// export default ...;