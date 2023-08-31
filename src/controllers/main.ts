import { LinkShrink } from "../models/linkShrink";

export class MainController {
    static getMainPage(req, res, next) {
        const linkShrinks = LinkShrink.findAll();
        res.render('main', { myNumber: 5, linkShrinks });
    }
}