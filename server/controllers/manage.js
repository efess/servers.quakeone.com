var express = require('express'),
    auth = require('../middleware/auth'),
    path = require('path'),
    router = express.Router();

router.use(auth);
router.get('/*', function(req,res) {
    res.sendFile(path.join(__dirname, '../../html', 'manage.html'));
});

module.exports = router