var express = require('express');

var indexRouter = require('./api/routes/index');
var saleRouter = require('./api/routes/sales');
var explainerRouter = require('./api/routes/explainers');

const mongoose = require('mongoose');
const cors = require('cors')

const env = require('../../environments/environment');

function handle(app) {
	
	const connectDB = async () => {
		try {
			const conn = await mongoose.connect(`mongodb://${env.configuration.DB_SERVER.host}:${env.configuration.DB_SERVER.port}/${env.configuration.DB_SERVER.db}`,{
				useNewUrlParser: true,
				useUnifiedTopology: true, 
				useFindAndModify: false
			})
			console.log(`MongoDB Connected: ${conn.connection.host}`);
		} catch (err) {
			console.log(`Error: ${err.message}`);
			process.exit(1);
		}
	}
	connectDB();

	app.use(cors());
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	app.use('/', indexRouter);
	app.use('/sale', saleRouter);
	app.use('/explainer', explainerRouter);

	// error handler
	app.use(function(err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		// render the error page
		res.status(err.status || 500);
		res.render('error');
	});
}

//----------      
exports.handle = handle;