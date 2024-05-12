import fs from 'fs';
import path from 'path';
import { Express } from "express";
import { UploadedFile } from 'express-fileupload';


//This is a virtual s3.ts file that is used to mock the s3 service. This will just save files to local

const baseUploadPath = path.join(__dirname, "../uploads");

export function uploadFile(file: UploadedFile, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(baseUploadPath, filePath);

        //Create directory if not exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true
            });
        }

        fs.writeFile(fullPath, file.data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(baseUploadPath, filePath);
        fs.unlink(fullPath, (err) => {
            resolve();
        });
    });
}

export function deleteDirectory(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(baseUploadPath, filePath);
        fs.rm(fullPath, { recursive: true }, (err) => {
            resolve();
        });
    });
}


export function getFileStream(filePath: string) {
    const fullPath = path.join(baseUploadPath, filePath);
    return fs.createReadStream(fullPath);
}

export function getFileListOfPath(filePath: string): string[] {
    const fullPath = path.join(baseUploadPath, filePath);
    if (!fs.existsSync(fullPath)) {
        return [];
    }
    return fs.readdirSync(fullPath);
}