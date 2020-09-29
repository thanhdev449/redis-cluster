const mongoose = require('mongoose');

const SaleSchema = mongoose.Schema({
    vip: String,
    visitor_code: String,
    room_id: String,
    status: Number,
    call_start: Date,
    call_end: Date
   
}, {
    timestamps: true
});

module.exports = mongoose.model('Sale', SaleSchema);