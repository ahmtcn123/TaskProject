import { Router } from "express";
import prisma from "../utils/dbClient";
import { deleteDirectory, deleteFile, getFileListOfPath, getFileStream, uploadFile } from "../utils/s3";
import { v4 } from "uuid";
import mime from "mime-types";
import { tryJsonParse } from "../utils";

const router = Router();

//? GET Operations //

// Get all todos
router.get("/", async (req, res) => {
    if (!req.body.userId) {
        return res
            .status(400)
            .json({ status: false, message: "userId is required", data: null });
    }

    const notes = await prisma.todoEntry.findMany({
        where: {
            userId: req.body.userId,
        },
    });
    res.json({
        status: true,
        message: "Todos fetched successfully",
        data: notes.map((note) => ({
            ...note,
            thumbnail: note.thumbnail.split("/").pop(),
            attachments: note.attachments.map((attachment) =>
                attachment.split("/").pop()
            ),
        })),
    });
});

//Get thumbnail of a todo. No db operations for performance
router.get("/:id/thumbnail", async (req, res) => {
    if (!req.body.userId) {
        return res
            .status(400)
            .json({ status: false, message: "userId is required", data: null });
    }

    const path = `users/${req.body.userId}/todos/${req.params.id}/`;
    const fileList = await getFileListOfPath(path);

    if (!fileList.length) {
        return res
            .status(404)
            .json({ status: false, message: "Todo not found", data: null });
    }

    const todo = fileList.find((file) => file.startsWith("thumbnail"));
    if (!todo) {
        return res
            .status(404)
            .json({ status: false, message: "Thumbnail not found", data: null });
    }

    const file = getFileStream(path + todo);
    res.setHeader("Content-Type", mime.lookup(todo) || "image/jpeg");
    file.pipe(res);
});

//Download attachment of a todo
router.get("/:id/attachment/:attachment", async (req, res) => {
    if (!req.body.userId || !req.params.id || !req.params.attachment) {
        return res
            .status(400)
            .json({
                status: false,
                message: "UserId, TodoId and attachment is required",
                data: null,
            });
    }

    //If '/' or '\' or '..' is present in attachment name prevent directory traversal
    if (req.params.attachment.includes("/") || req.params.attachment.includes("\\") || req.params.attachment.includes("..")) {
        return res
            .status(400)
            .json({
                status: false,
                message: "Invalid attachment name",
                data: null,
            });
    }

    const path = `users/${req.body.userId}/todos/${req.params.id}/${req.params.attachment}`;
    const file = getFileStream(path);
    res.setHeader("Content-Type", mime.lookup(req.params.attachment) || "application/octet-stream");
    file.pipe(res);
});


//! POST Operations //

//Update todo
router.post("/:id", async (req, res) => {
    if (!req.body.userId || !req.params.id) {
        return res
            .status(400)
            .json({
                status: false,
                message: "UserId and TodoId is required",
                data: null,
            });
    }

    //If no data to update
    if (
        !req.body.title &&
        !req.body.content &&
        !req.body.tags &&
        !req.body.isDone &&
        !req.files?.["thumbnail"]
    ) {
        return res
            .status(400)
            .json({
                status: false,
                message: "No data to update",
                data: null,
            });
    }


    const title = req.body.title;
    const content = req.body.content;
    //[1] provided as a string intentionally to trigger "Invalid data types" message
    const tags = req.body.tags ? tryJsonParse(req.body.tags) ? JSON.parse(req.body.tags) : [1] : null;
    //"null" provided as a string intentionally to trigger "Invalid data types" message

    if (
        (title && typeof title !== "string") ||
        (content && typeof content !== "string") ||
        (tags && (!Array.isArray(tags) || Array.isArray(tags) && tags.some((tag: string) => typeof tag !== "string"))) ||
        (req.body.isDone && req.body.isDone !== "true" && req.body.isDone !== "false")
    ) {
        return res
            .status(400)
            .json({ status: false, message: "Invalid data types", data: null });
    }

    const thumbnail = req.files?.["thumbnail"];
    if (thumbnail) {
        if (Array.isArray(thumbnail)) {
            return res
                .status(400)
                .json({
                    status: false,
                    message: "Only one thumbnail is allowed",
                    data: null,
                });
        }

        //If thumbnail is not an image
        if (!["image/png", "image/jpeg"].includes(thumbnail.mimetype)) {
            return res
                .status(400)
                .json({
                    status: false,
                    message: "Only png and jpeg images are allowed",
                    data: null,
                });
        }
    }

    const existingTodo = await prisma.todoEntry.findFirst({
        where: {
            id: req.params.id,
            userId: req.body.userId,
        },
    });

    if (!existingTodo) {
        return res
            .status(404)
            .json({ status: false, message: "Todo not found", data: null });
    }

    // upload thumbnail
    let thumbnailPath = existingTodo.thumbnail;
    if (thumbnail) {
        const extension = mime.extension(thumbnail.mimetype);
        thumbnailPath = `users/${req.body.userId}/todos/${req.params.id}/thumbnail.${extension}`;
        await uploadFile(thumbnail, thumbnailPath);
    }

    const note = await prisma.todoEntry.update({
        where: {
            id: req.params.id,
            userId: req.body.userId,
        },
        data: {
            title: title || existingTodo.title,
            content: content || existingTodo.content,
            tags: tags || existingTodo.tags,
            thumbnail: thumbnailPath,
            isDone: req.body.isDone ? req.body.isDone == "true" : existingTodo.isDone,
        },
    });
    res.json({
        status: true,
        message: "Todo updated successfully",
        data: {
            ...note,
            thumbnail: note.thumbnail.split("/").pop(),
            attachments: note.attachments.map((attachment) =>
                attachment.split("/").pop()
            ),
        },
    });
});

//Create new todo
router.put("/", async (req, res) => {
    if (
        !req.body.title ||
        !req.body.content ||
        !req.body.userId ||
        !req.files?.["thumbnail"]
    ) {
        return res
            .status(400)
            .json({
                status: false,
                message: "Title, content and thumbnail is required",
                data: null,
            });
    }
    const thumbnail = req.files?.["thumbnail"];
    if (Array.isArray(thumbnail)) {
        return res
            .status(400)
            .json({
                status: false,
                message: "Only one thumbnail is allowed",
                data: null,
            });
    }

    //If thumbnail is not an image
    if (!["image/png", "image/jpeg"].includes(thumbnail.mimetype)) {
        return res
            .status(400)
            .json({
                status: false,
                message: "Only png and jpeg images are allowed",
                data: null,
            });
    }

    const newTodoId = v4();
    const extension = mime.extension(thumbnail.mimetype);
    const path = `users/${req.body.userId}/todos/${newTodoId}/thumbnail.${extension}`;

    await uploadFile(thumbnail, path);
    const note = await prisma.todoEntry.create({
        data: {
            id: newTodoId,
            title: req.body.title,
            content: req.body.content,
            userId: req.body.userId,
            thumbnail: path,
        },
    });
    res.json({
        status: true,
        message: "Todo created successfully",
        data: {
            ...note,
            thumbnail: path.split("/").pop(),
        },
    });
});



//Delete todo
router.delete("/:id", async (req, res) => {
    if (!req.body.userId || !req.params.id) {
        return res
            .status(400)
            .json({
                status: false,
                message: "UserId and TodoId is required",
                data: null,
            });
    }

    const existingTodo = await prisma.todoEntry.findFirst({
        where: {
            id: req.params.id,
            userId: req.body.userId,
        },
    });

    if (!existingTodo) {
        return res
            .status(404)
            .json({ status: false, message: "Todo not found", data: null });
    }

    await prisma.todoEntry.delete({
        where: {
            id: req.params.id,
        },
    });
    await deleteDirectory(`users/${req.body.userId}/todos/${req.params.id}`);
    res.json({
        status: true,
        message: "Todo deleted successfully",
        data: null,
    });
});

//Add attachment to todo
router.put("/:id/attachment", async (req, res) => {
    if (!req.body.userId || !req.params.id || !req.files?.["attachment"]) {
        return res
            .status(400)
            .json({
                status: false,
                message: "UserId, TodoId and attachment is required",
                data: null,
            });
    }

    const existingTodo = await prisma.todoEntry.findFirst({
        where: {
            id: req.params.id,
            userId: req.body.userId,
        },
    });

    if (!existingTodo) {
        return res
            .status(404)
            .json({ status: false, message: "Todo not found", data: null });
    }

    const attachments = Array.isArray(req.files["attachment"]) ? req.files["attachment"] : [req.files["attachment"]];

    const uploadedAttachments = [];
    for (const attachment of attachments) {
        const path = `users/${req.body.userId}/todos/${req.params.id}/${attachment.name}`;
        await uploadFile(attachment, path);
        uploadedAttachments.push(path);
    }

    const note = await prisma.todoEntry.update({
        where: {
            id: req.params.id,
            userId: req.body.userId,
        },
        data: {
            attachments: {
                push: uploadedAttachments,
            },
        },
    });

    res.json({
        status: true,
        message: "Attachment added successfully",
        data: {
            ...note,
            thumbnail: note.thumbnail.split("/").pop(),
            attachments: note.attachments.map((attachment) =>
                attachment.split("/").pop()
            ),
        },
    });
});



//Delete todo attachment
router.delete("/:id/attachment/:attachment", async (req, res) => {
    if (!req.body.userId || !req.params.id || !req.params.attachment) {
        return res
            .status(400)
            .json({
                status: false,
                message: "UserId, TodoId and attachment is required",
                data: null,
            });
    }

    const existingTodo = await prisma.todoEntry.findFirst({
        where: {
            id: req.params.id,
            userId: req.body.userId,
        },
    });

    if (!existingTodo) {
        return res
            .status(404)
            .json({ status: false, message: "Todo not found", data: null });
    }

    //If '/' or '\' or '..' is present in attachment name prevent directory traversal
    if (req.params.attachment.includes("/") || req.params.attachment.includes("\\") || req.params.attachment.includes("..")) {
        return res
            .status(400)
            .json({
                status: false,
                message: "Invalid attachment name",
                data: null,
            });
    }

    const attachment = existingTodo.attachments.find((att) => att.endsWith(req.params.attachment));
    if (!attachment) {
        return res
            .status(404)
            .json({ status: false, message: "Attachment not found", data: null });
    }

    await deleteFile(attachment);

    await prisma.todoEntry.update({
        where: {
            id: req.params.id,
            userId: req.body.userId,
        },
        data: {
            attachments: {
                set: existingTodo.attachments.filter((att) => att !== attachment),
            },
        },
    });

    res.json({
        status: true,
        message: "Attachment deleted successfully",
        data: null
    });
});


export default router;
