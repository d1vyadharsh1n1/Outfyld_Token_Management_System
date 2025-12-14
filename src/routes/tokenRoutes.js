import express from 'express';
import { prevToken } from '../controllers/tokenController.js';

const router = express.Router();

router.post('/prev', prevToken);

export default router;