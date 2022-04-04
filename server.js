const app = require('./app')
console.log(new Date());

const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
require('dotenv').config();
// Kiểm tra Database
function assertDatabaseConnectionOk() {
	console.log(`Checking database connection...`);
	try {
        mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
		console.log('Database connection OK!');
	} catch (error) {
		console.log('Unable to connect to the database:');
		console.log(error.message);
		process.exit(1);
	}
}

// Chạy ứng dụng
function init() {
	assertDatabaseConnectionOk();
    console.log(`Starting app on port ${PORT}...`);
	app.listen(PORT, () => {
		console.log(`Express server started on port ${PORT}. Try some routes, such as '/api/users'.`);
	});
}

// Bắt đầu chạy
init();