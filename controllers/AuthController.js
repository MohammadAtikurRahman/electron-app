"use strict";

const Validator = require("validatorjs");

class AuthController {
    constructor() {
        this.registrationRules = {
            email: "required|email",
            password: "required|min:8"
        };

        this.loginRules = {
            email: "required|email",
            password: "required|min:8"
        };
    }
    static async register() {
        try {
            if (req.body && req.body.username && req.body.password) {
                user.find({ username: req.body.username }, (err, data) => {
                    if (data.length == 0) {
                        let User = new user({
                            username: req.body.username,
                            password: req.body.password,
                        });
                        User.save((err, data) => {
                            if (err) {
                                res.status(400).json({
                                    errorMessage: err,
                                    status: false,
                                });
                            } else {
                                res.status(200).json({
                                    status: true,
                                    title: "Registered Successfully.",
                                });
                            }
                        });
                    } else {
                        res.status(400).json({
                            errorMessage: `Username ${req.body.username} already exist!`,
                            status: false,
                        });
                    }
                });
            } else {
                res.status(400).json({
                    errorMessage: "Add proper parameter first!",
                    status: false,
                });
            }
        } catch (e) {
            res.status(400).json({
                errorMessage: "Something went wrong!",
                status: false,
            });
        }
    }
}

module.exports = AuthController