var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Movie Compare', controller: 'javascripts/indexController.js' });
});

module.exports = router;
