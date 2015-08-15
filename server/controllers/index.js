var express = require('express')
  , router = express.Router();

router.use('/home', require('./home'));
router.use('/server', require('./server'));
router.use('/player', require('./player'));
router.use('/match', require('./match'));
router.use('/', require('./root'));



module.exports = router