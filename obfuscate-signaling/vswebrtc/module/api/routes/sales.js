var express = require('express');
var router = express.Router();
var controller = require('./../controllers/sale.controller');

/* GET call listing. */
router.get('/getCallListBySale', controller.getCallListBySale);

/* POST create call. */
router.post('/registerToSaleCallList', controller.registerToSaleCallList);

/* POST update status. */
router.post('/updateStatus', controller.updateStatus);

/* GET get item. */
router.get('/getItemById', controller.getItemById);

module.exports = router;
