const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'db92vv0cb',
    api_key: '523132737832711',
    api_secret: 'LCrqnyMac4Z0Sbozx1kYImYo_TM',
    secure: true
});

module.exports = cloudinary;