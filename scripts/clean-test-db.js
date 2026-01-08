const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI.replace('resqlink_test', 'resqlink_test_clean'));
mongoose.connection.dropDatabase().then(() => process.exit(0));
