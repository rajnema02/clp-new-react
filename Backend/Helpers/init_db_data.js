const debug_init = require('debug')(process.env.DEBUG+':db_init')

// INIT START //
// const { exec } = require('child_process')
// exec('node ./Scripts/init_auth.js',(err, stdout, stderr) => {
//   if (err) {
//     debug_init('err:'+err)
//   }
//   if (stdout) {
//     debug_init('stdout:'+stdout)
//   }
//   if (stderr) {
//     debug_init('stderr:'+stderr)
//   }
// })
// INIT END //