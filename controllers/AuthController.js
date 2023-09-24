"use strict";
const { PrismaClient } = require("@prisma/client");
const Validator = require("validatorjs");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
    constructor() {
        this.saltRounds = 10;
        this.sale = this.registrationRules = {
            username: "required",
            password: "required|min:4",
        };

        this.loginRules = {
            username: "required",
            password: "required|min:4",
        };
    }

    async hashPassword(plainPassword) {
        try {
            return await bcrypt.hash(plainPassword, this.saltRounds);
        } catch (e) {
            console.log("Error hashing", e);
        }
    }
    async comparePassword(hashedPassword, inputPassword) {
        try {
            return await bcrypt.compare(hashedPassword, inputPassword);
        } catch (e) {
            console.log(e);
        }
    }
    async userExists(userName) {
        try {
            const userCount = await prisma.user.count({
                where: {
                    username: userName,
                },
            });
            if (userCount > 0) return true;
            return false;
        } catch (e) {
            console.log(e);
        }
    }

    generateToken(data) {
        return jwt.sign(data, process.env.SECRET_KEY, { expiresIn: "72h" });
    }

    async register(req, res) {
        try {
            const request = req.body;
            const requestValidation = new Validator(
                request,
                this.registrationRules
            );
            if (requestValidation.fails()) {
                throw {
                    status: 400,
                    message: "Invalid Request",
                    errors: requestValidation.errors.all(),
                };
            }
            if (await this.userExists(request.username)) {
                throw {
                    status: 400,
                    message:
                        "User exists.Please try different username or Login",
                    errors: [],
                };
            }
            let user = await prisma.user.create({
                data: {
                    username: request.username,
                    password: await this.hashPassword(request.password),
                },
            });

            return res.status(200).json({
                success: true,
                message: "Successfully created user",
                data: {
                    ...user,
                    token: this.generateToken({
                        id: user.id,
                        username: user.username,
                    }),
                },
            });
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
            const request = req.body;
            const validation = new Validator(request, this.loginRules);
            if (validation.fails()) {
                throw {
                    status: 400,
                    message: "Invalid credentials",
                    errors: validation.errors.all(),
                };
            }

            const user = await prisma.user.findFirst({
                where: {
                    username: request.username,
                },
            });

            if (!user) {
                throw {
                    status: 400,
                    message: "User does not exists. Please sign up first.",
                };
            }

            if (await this.comparePassword(request.password, user.password)) {
                return res.status(200).json({
                    success: true,
                    message: "Logged in successfully",
                    data: {
                        ...user,
                        token: this.generateToken({
                            id: user.id,
                            username: user.username,
                        }),
                    },
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(e?.status || 500).json({
                errors: e?.errors,
                message: e?.message,
                success: false,
            });
        }
    }
}

module.exports = AuthController;
