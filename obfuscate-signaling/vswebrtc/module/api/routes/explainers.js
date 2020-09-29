var express = require('express');
var router = express.Router();
var controller = require('../controllers/explainer.controller');

/* GET users listing. */
router.get('/getCallListByExplainer', controller.getCallListByExplainer);

/* POST users listing. */
router.post('/registerToExplainerCallList', controller.registerToExplainerCallList);

/* POST users listing. */
router.post('/updateStatus', controller.updateStatus);

/* GET get item. */
router.get('/getItemById', controller.getItemById);

module.exports = router;
