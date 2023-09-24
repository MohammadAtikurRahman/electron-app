const express = require("express")
const router = express.Router()

const AuthController = require("../controllers/AuthController")
const authController = new AuthController()

router.post("/register", (req, res) => {
    authController.register(req, res)
})

module.exports = router

