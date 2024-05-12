import { PrismaClient } from '@prisma/client'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fileUpload from 'express-fileupload';
import 'dotenv/config'
import auth from './routes/auth'
import todos from './routes/todos'
import { checkJwt } from './utils/middlewares';

const prisma = new PrismaClient()
const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
})); //enable cors
app.use(helmet());
app.use(express.json());

//Give 400 error on invalid json
app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).send({ status: false, message: "Invalid JSON" });
    }
    next();
});

//Initialize busyboy
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, //50mb
}));

//auth route
app.use("/auth", auth);

//todo route
app.use("/todos", checkJwt, todos);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
