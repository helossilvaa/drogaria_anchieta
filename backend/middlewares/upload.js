import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    // Se quiser decidir com base na rota:
    let folder = "uploads";

    if (req.originalUrl.includes("/funcionarios")) {
      folder = "uploads/funcionarios";
    } else if (req.originalUrl.includes("/usuarios")) {
      folder = "uploads/usuarios";
    }

    // Cria a pasta automaticamente se não existir
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${file}`);
  },
});

const upload = multer({ storage });

export default upload;
