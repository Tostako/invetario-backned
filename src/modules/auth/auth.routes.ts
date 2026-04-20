import { Router } from 'express';
import { login, registerShop, loginCustomer, registerCustomer } from './auth.controller';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', login);

// POST /api/v1/auth/register
router.post('/register', registerShop);

// POST /api/v1/auth/customer/login
router.post('/customer/login', loginCustomer);

// POST /api/v1/auth/customer/register
router.post('/customer/register', registerCustomer);

export { router as authRouter };
