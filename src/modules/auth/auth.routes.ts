import { Router } from 'express';
import { login, registerShop, loginCustomer, registerCustomer, selectShop, getUserShops, switchShop } from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', login);

// POST /api/v1/auth/select-shop
router.post('/select-shop', authenticate, selectShop);

// POST /api/v1/auth/register
router.post('/register', registerShop);

// POST /api/v1/auth/customer/login
router.post('/customer/login', loginCustomer);

// POST /api/v1/auth/customer/register
router.post('/customer/register', registerCustomer);

// GET /api/v1/auth/shops
router.get('/shops', authenticate, getUserShops);

// POST /api/v1/auth/switch-shop
router.post('/switch-shop', authenticate, switchShop);

export { router as authRouter };
