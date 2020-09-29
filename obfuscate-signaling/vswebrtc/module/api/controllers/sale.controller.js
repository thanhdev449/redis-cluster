
const Sale = require('../models/sale.model.js');

module.exports.registerToSaleCallList = function (req, res, next) {
    try {
        // Validate request
        if(!req.body.visitor_code) {
            return res.status(400).send({
                message: "Visitor code can not be empty"
            });
        }
        if(!req.body.vip) {
            return res.status(400).send({
                message: "Vip can not be empty"
            });
        }
        if(!req.body.room_id) {
            return res.status(400).send({
                message: "Room id can not be empty"
            });
        }
        
        // Create a Room for Sale
        const sale = new Sale({
            vip: req.body.vip, 
            visitor_code: req.body.visitor_code, 
            room_id: req.body.room_id,
            status: 1,
            call_start: null,
            call_end: null
        });

        // Save in the database
        sale.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Room."
            });
        });
    } catch (error) {
        return res.status(400).send({
            message: error.message || "Request Failed."
        });
    }
};

module.exports.getCallListBySale = function (req, res, next) {
    try {
        Sale.find().sort({createdAt:-1}).then(data=>{
            return res.send(data);
        });
    } catch (error) {
        return res.status(400).send({
            message: error.message || "Request Failed."
        });
    }
};

module.exports.updateStatus = function (req, res, next) {
    try {
        // Validate request
        if (req.query.id == null) {
            return res.status(400).send({
                message: "Id invalid"
            });
        }
        if (isNaN(req.body.status)) {
            return res.status(400).send({
                message: "Status invalid"
            });
        }
        
        // Update status
        let data  = {status:req.body.status};
        if(req.body.status == 3){
            data.call_start = new Date();
        }
        if(req.body.status == 4){
            data.call_end = new Date();
        }
        Sale.updateOne({_id: req.query.id}, data).then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while update status."
            });
        });
        
    } catch (error) {
        return res.status(400).send({
            message: error.message || "Request Failed."
        });
    }
};

module.exports.getItemById = function (req, res, next) {
    try {
        // Validate request
        if (req.query.id == null) {
            return res.status(400).send({
                message: "Id invalid"
            });
        }
        // console.log(req.query.id);
        Sale.findOne({_id: req.query.id}).then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while get status."
            });
        });
        
    } catch (error) {
        return res.status(400).send({
            message: error.message || "Request Failed."
        });
    }
};