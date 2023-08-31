import { MainController } from '../controllers/main';
import express from 'express';

const router = express.Router();

router.get('/', MainController.getMainPage)

export default router;