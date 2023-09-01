import { MainController } from '../controllers/main';
import { Router } from 'express';

const router = Router();

router.post('/add', MainController.addNewLink);

// Works for both modes - service and with server side rendering with redirection
router.get('/ls/:linkHash', MainController.checkLinkAndRedirect);

// For service mode - for allowing getting list of linkShrink items by outer source
router.get('/getList', MainController.getList);

// For removing item from the list
router.post('/remove/:linkId', MainController.removeLink);

// For rendering editor page
router.post('/editor', MainController.getEditorPage);

// For updating item in the list by id
router.put('/edit/:linkId', MainController.updateLink);
// For rendering mode we use post due to html form
router.post('/edit/:linkId', MainController.updateLink);

router.get('/', MainController.getMainPage);

router.use('/*', MainController.getNotFoundPage);

export default router;