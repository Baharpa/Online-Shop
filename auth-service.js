onst mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;

//Mongoose Schema
let userSchema = new Schema({
    userName: { 
        type: String, 
        unique: true 
    },
    password: String,
    email: String,
    loginHistory:[
        { dateTime: Date, 
          userAgent: String 
        }
    ],
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://pereiraalejandrav:I8uc4XN7qAGEglPr@assignment6.nc6ce.mongodb.net/");

        db.on('error', (err)=>{
            reject(err);
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};


module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection("mongodb+srv://mahinibnealam:6477173150@cluster0.uubf8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

        db.on("error", (err) => {
            reject(err);
        });
        db.once("open", () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10) // Hash the password
                .then((hashedPassword) => {
                    let newUser = new User({
                        userName: userData.userName,
                        password: hashedPassword, 
                        email: userData.email,
                        loginHistory: []
                    });

                    newUser.save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code === 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: " + err);
                            }
                        });
                })
                .catch((err) => {
                    reject("There was an error encrypting the password");
                });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .then((users) => {
                if (users.length === 0) {
                    reject(`Unable to find user: ${userData.userName}`);
                } else {
                    bcrypt.compare(userData.password, users[0].password) // Compare the entered password with the hashed password
                        .then((result) => {
                            if (result === false) {
                                reject(`Incorrect Password for user: ${userData.userName}`);
                            } else {
                                users[0].loginHistory.push({
                                    dateTime: new Date().toString(),
                                    userAgent: userData.userAgent
                                });

                                User.updateOne(
                                    { userName: users[0].userName },
                                    { $set: { loginHistory: users[0].loginHistory } }
                                )
                                    .then(() => {
                                        resolve(users[0]);
                                    })
                                    .catch((err) => {
                                        reject("There was an error verifying the user: " + err);
                                    });
                            }
                        })
                        .catch(() => {
                            reject("Error comparing passwords");
                        });
                }
            })
            .catch(() => {
                reject(`Unable to find user: ${userData.userName}`);
            });
    });
};