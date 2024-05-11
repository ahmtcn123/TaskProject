import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

//JWT check middleware
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ status: false, message: "Token is required", data: null });
    }

    try {
        const verified = jwt.verify(token as string, process.env.JWT_SECRET as string);
        req.body.userId = (verified as any).id;
        next();
    } catch (error) {
        return res.status(401).json({ status: false, message: "Token is not valid", data: null });
    }
};