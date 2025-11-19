import express from "express";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/upload", upload.single("foto"), (req, res) => {
    return res.json({
        message: "Upload feito!",
        filePath: `/uploads/${req.file.filename}`
    });
});

export default router;
