import { Router } from 'express';
import { login, registerShop } from './auth.controller';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', login);

// POST /api/v1/auth/register
router.post('/register', registerShop);

export { router as authRouter };
