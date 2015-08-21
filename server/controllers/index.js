var express = require('express')
  , router = express.Router();

router.use('/api/home', require('./home'));
router.use('/api/server', require('./server'));
router.use('/api/player', require('./player'));
router.use('/api/match', require('./match'));
router.use('/manage', require('./manage'));
router.use('/', require('./root'));



module.exports = router