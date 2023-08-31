import { MainController } from '../controllers/main';
import { Router } from 'express';

const router = Router();

router.get('/', MainController.getMainPage)

export default router;