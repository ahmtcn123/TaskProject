import { Router } from "express";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../utils";
import prisma from "../utils/dbClient";

const router = Router();

router.post("/login", async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ status: false, message: "Email and password is required", data: null });
    }
    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email
        }
    });

    if (!user) {
        return res.status(400).json({ status: false, message: "Wrong mail or password", data: null });
    }

    const isPasswordMatch = await comparePassword(req.body.password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ status: false, message: "Wrong mail or password", data: null });
    }

    //Generate jsonwebtoken
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: "1d"
    });

    res.json({ status: true, message: "Login Success", data: token });
});

router.put("/register", async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ status: false, message: "Email and password is required", data: null });
    }

    //chekck if email is correct
    if (!req.body.email.includes("@")) {
        return res.status(400).json({ status: false, message: "Email is not valid", data: null });
    }

    const isUserAlreadyRegistered = await prisma.user.findUnique({
        where: {
            email: req.body.email
        }
    });

    if (isUserAlreadyRegistered) {
        return res.status(400).json({ status: false, message: "User already registered", data: null });
    }

    const user = await prisma.user.create({
        data: {
            email: req.body.email,
            password: await hashPassword(req.body.password)
        }
    });

    //Generate jsonwebtoken
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: "1d"
    });
    res.json({ status: true, message: "Register Success", data: token });
});




export default router;