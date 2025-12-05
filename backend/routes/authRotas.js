import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { loginController, cadastroUsuarioController, alterarSenhaController } from '../controllers/authController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// upload de foto de funcionário
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../front-end/public/img/usuarios'));
  },
  filename: (req, file, cb) => {
    const nomeArquivo = `${Date.now()}-${file.originalname}`;
    cb(null, nomeArquivo);
  },
});

const upload = multer({ storage });

// Rota de cadastro de usuário
router.post('/cadastro', upload.single('foto'), cadastroUsuarioController);

// Rota de login
router.post('/login', loginController);

router.patch('/usuarios/:id', alterarSenhaController);
// Rota de logout

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ mensagem: 'Logout realizado. Cookie JWT removido.' });
  });
  

router.get('/check-auth', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ authenticated: false, message: 'Token ausente' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      authenticated: true,
      user: decoded, 
    });
  } catch (error) {
    res.status(401).json({ authenticated: false, message: 'Token inválido ou expirado' });
  }
});

export default router;
