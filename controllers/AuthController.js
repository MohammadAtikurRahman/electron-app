"use strict";
const { PrismaClient } = require("@prisma/client");
const Validator = require("validatorjs");
const prisma = new PrismaClient()
const bcrypt = require("bcrypt")

class AuthController {
    constructor() {
        this.saltRounds = 10;
        this.sale =
            this.registrationRules = {
                username: "required",
                password: "required|min:4"
            };

        this.loginRules = {
            email: "required|email",
            password: "required|min:8"
        };
    }

    async hashPassword(plainPassword) {
        try {
            return await bcrypt.hash(plainPassword, this.saltRounds);
        }
        catch (e) {
            console.log("Error hashing", e);
        }
    }
    async comparePassword(hashedPassword) {
        try {
            await bcrypt.compare(hashedPassword, this.saltRounds);
        }
        catch (e) {
            console.log(e)
        }

    }
    async userExists(userName) {
        try {
            const userCount = await prisma.user.count({
                where: {
                    username: userName,
                }
            })
            if (userCount > 0) return true;
            return false;
        }
        catch (e) {
            console.log(e)
        }
    }
    async register(req, res) {
        try {
            const request = req.body
            const requestValidation = new Validator(request, this.registrationRules)
            if (requestValidation.fails()) {
                throw {
                    status: 400,
                    message: "Invalid Request",
                    errors: requestValidation.errors.all()
                }
            }
            if (await this.userExists(request.username)) {
                throw ({
                    status: 400, message: "User exists.Please try different username or Login", errors: [],
                })
            }
            let user = await prisma.user.create({
                data: {
                    username: request.username,
                    password: await this.hashPassword(request.password)
                }
            })
            return res.status(200).json({
                success: true,
                message: "Successfully created user",
                data: user,
            })
        } catch (e) {
            res.status(e?.status || 500).json({
                errors: e?.errors,
                message: e?.message,
                success: false,
            });
        }
    }

    async login(req, res) {
        try {
            request = req.body
            const validation = new validation(request, this.loginRules);
            if (validation.fails()) {
                throw ({
                    status: 400,
                    message: "Invalid credentials",
                    errors: validation.errors.all()
                })
            }

            const user = prisma.user.findUnique({
                where: {
                    username: request.username
                }
            })

            if (!user) {
                throw {
                    status: 400,
                    message: "User does not exists. Please sign up first.",
                }
            }

            if (await this.comparePassword(request.password, user.password)) {
                return res.status(200).json({
                    success: true,
                    message: "Logged in successfully",
                    data: {
                        token: "",
                    }
                })
            }


        } catch (e) {
            res.status(e?.status || 500).json({
                errors: e?.errors,
                message: e?.message,
                success: false,
            });
        }
    }
}

module.exports = AuthController
