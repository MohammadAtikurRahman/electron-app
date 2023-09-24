"use strict";
const { Prisma, PrismaClient } = require("@prisma/client");
const Validator = require("validatorjs");
const prisma = new PrismaClient()

class AuthController {
    constructor() {
        this.registrationRules = {
            username: "required",
            password: "required|min:4"
        };

        this.loginRules = {
            email: "required|email",
            password: "required|min:8"
        };
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
                    password: request.password

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
}

module.exports = AuthController