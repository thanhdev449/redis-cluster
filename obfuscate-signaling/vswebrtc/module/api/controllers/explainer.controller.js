
const Explainer = require('../models/explainer.model.js');

module.exports.registerToExplainerCallList = async function (req, res, next) {
    try {
        // Validate request
        if(!req.body.visitor_code) {
            return res.status(400).send({
                message: "Visitor code can not be empty"
            });
        }
        if(!req.body.room_id) {
            return res.status(400).send({
                message: "Room id can not be empty"
            });
        }
        let explainer =  await Explainer.find({room_id: req.body.room_id});
        if(explainer.length>0){
            res.send(true);
        }else{
            // Create a Room for Explainer
            const explainer = new Explainer({
                visitor_code: req.body.visitor_code, 
                room_id: req.body.room_id,
                status: 1,
                call_start: null,
                call_end: null
            });

            // Save in the database
            explainer.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the Room."
                });
            });
        }
        
    } catch (error) {
        return res.status(400).send({
            message: error.message || "Request Failed."
        });
    }
};

module.exports.getCallListByExplainer = function (req, res, next) {
    try {
        Explainer.find().sort({createdAt:-1}).then(data=>{
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
        if (req.query.room_id == null) {
            return res.status(400).send({
                message: "Room id invalid"
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
        Explainer.updateOne({room_id: req.query.room_id}, data).then(data => {
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
        Explainer.findOne({_id: req.query.id}).then(data => {
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