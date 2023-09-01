/* node */
import url from 'url';

/* 3rd party */
import { v4 as uuidv4 } from 'uuid';

/* application */
import { LinkShrink } from "../models/linkShrink";
import { RequestResultStatusEnum } from '../enums/requestResultStatus.enum';

const MIN_URL_HASH_SIZE = 4;
const MAX_URL_HASH_SIZE = 31 // size of uuidv4 hash

export class MainController {
    constructor() {}

    static getMainPage(req, res, next) {
        // Get list of existing links by user Admin
        // P.S. We're filtering here by user to show that with authorization 
        // system each user will see only own list of shor links.
        // For now it's always Admin user
        LinkShrink.findAll({ 
            where: { user: 'Admin'},
            order: [
                ['id', 'DESC']
            ]
        })
        .then((linkShrinks) => {
            res.render('main', { linkShrinks, newHash: req.query.newHash, urlHost: req.protocol + '://' + req.get('host'), addStatus: req.query.status, RequestResultStatusEnum});
        })
        .catch(err => {
            console.log(err);
            res.render('main', { addStatus: req.query.status });
        });
    }

    static getEditorPage(req, res, next) {
        if (req?.body?.linkId) {
            const { linkId, linkTitle, linkUrl } = req?.body;
            res.render('editor', { linkId, linkTitle, linkUrl });
        } else {
            res.status(400).redirect(url.format({
                pathname: '/',
                query: {
                    status: RequestResultStatusEnum.EDITING_FAILED
                }
            }));
        }
        // Get list of existing links by user Admin
        // P.S. We're filtering here by user to show that with authorization 
        // system each user will see only own list of shor links.
        // For now it's always Admin user
        LinkShrink.findAll({ 
            where: { user: 'Admin'},
            order: [
                ['id', 'DESC']
            ]
        })
        .then((linkShrinks) => {
            res.render('main', { linkShrinks, newHash: req.query.newHash, urlHost: req.protocol + '://' + req.get('host'), addStatus: req.query.status, RequestResultStatusEnum});
        })
        .catch(err => {
            console.log(err);
            res.render('main', { addStatus: req.query.status });
        });
    }

    static getList(req, res, next) {
        const user = 'Admin';
        LinkShrink.findAll({ 
            where: { user },
            order: [
                ['id', 'DESC']
            ]
        })
        .then((linkShrinks) => {
            res.status(200).send(linkShrinks);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
    }

    static getNotFoundPage(req, res, next) {
        res.render('notFound');
    }

    static addNewLink(req, res, next) {
        if (req?.body?.urlAddress) {
            const { title, urlAddress, renderMode } = req.body;
            MainController.getNewUrlHash()
            .then((hash) => {
                return LinkShrink.create({ title, url: urlAddress, user: 'Admin', hash})
            })
            .then((result) => {
                if (renderMode === 'enabled') {
                    res.status(200).redirect(url.format({
                        pathname: '/',
                        query: {
                            status: RequestResultStatusEnum.SUCCESS,
                            newHash: result.hash
                        }
                    }));
                // For case when we use app only as service (i.e. without rendering)
                } else {
                    const shortUrl = req.protocol + '://' + req.get('host') + '/ls/' + result.hash;
                    res.status(200).send({...(result?.dataValues ?? {}), shortUrl});
                }
            })
            .catch((err) => {
                console.log(err);
                if (renderMode === 'enabled') {
                    res.status(400).redirect(url.format({
                        pathname: '/',
                        query: {
                            status: RequestResultStatusEnum.NOT_ADDED
                        }
                    }));
                } else {
                    res.sendStatus(400);
                }
            });
        } else {
            if (req?.body?.renderMode === 'enabled') {
                res.status(400).redirect(url.format({
                    pathname: '/',
                    query: {
                        status: RequestResultStatusEnum.NOT_ADDED
                    }
                }));
            } else {
                req.sendStatus(400);
            }
        }
    }

    static checkLinkAndRedirect(req, res, next) {
        const linkHash = req?.params?.linkHash;
        // For avoiding SQL injection we're checking by MAX_URL_HASH_SIZE and 
        // removing spaces in user linkHash from url params
        const linkHashWithoutDashes = linkHash?.replace(/\s/g, '')?.toLowerCase();
        if (linkHashWithoutDashes?.length <= MAX_URL_HASH_SIZE) {
            LinkShrink.findOne({ 
                where: {
                    hash: linkHashWithoutDashes
                }
            })
            .then((foundItem) => {
                if (foundItem?.hash) {
                    res.status(200).redirect(foundItem.url);
                } else {
                    res.status(200).redirect(url.format({
                        pathname: '/',
                        query: {
                            status: RequestResultStatusEnum.NOT_FOUND_HASH
                        }
                    }));
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(200).redirect(url.format({
                    pathname: '/',
                    query: {
                        status: RequestResultStatusEnum.NOT_FOUND_HASH
                    }
                }));
            })
        } else {
            res.status(400).redirect(url.format({
                pathname: '/',
                query: {
                    status: RequestResultStatusEnum.NOT_FOUND_HASH
                }
            }));
        }
    }

    static removeLink(req, res, next) {
        const linkId = req?.params?.linkId;
        const renderMode = req?.body?.renderMode;
        if (linkId) {
            LinkShrink.findOne({ 
                where: {
                    id: linkId
                }
            })
            .then((linkShrink) => {
                if (linkShrink) {
                    linkShrink.destroy()
                    .then((result) => {
                        if (renderMode === 'enabled') {
                            res.status(200).redirect(url.format({
                                pathname: '/',
                                query: {
                                    status: RequestResultStatusEnum.DELETION_SUCCESS
                                }
                            }))
                        } else {
                            res.sendStatus(200);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        if (renderMode === 'enabled') {
                            res.status(400).redirect(url.format({
                                pathname: '/',
                                query: {
                                    status: RequestResultStatusEnum.DELETION_FAILED
                                }
                            }))
                        } else {
                            res.sendStatus(400);
                        }
                    })
                } else {
                    if (renderMode === 'enabled') {
                        res.status(400).redirect(url.format({
                            pathname: '/',
                            query: {
                                status: RequestResultStatusEnum.DELETION_FAILED
                            }
                        }))
                    } else {
                        res.sendStatus(400);
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                if (renderMode === 'enabled') {
                    res.status(400).redirect(url.format({
                        pathname: '/',
                        query: {
                            status: RequestResultStatusEnum.DELETION_FAILED
                        }
                    }))
                } else {
                    res.sendStatus(400);
                }
            })
        }
    }

    static updateLink(req, res, next) {
        const linkId = req?.params?.linkId;
        const renderMode = req?.body?.renderMode;
        if (linkId) {
            LinkShrink.findOne({ 
                where: {
                    id: linkId
                }
            })
            .then((linkShrink) => {
                const { linkTitle: title, linkUrl, generateHash } = req?.body;
                let updatedItem;
                if (generateHash) {
                    MainController.getNewUrlHash()
                    .then((hash) => {
                        updatedItem = { title, url: linkUrl, hash};
                        if (linkShrink) {
                            linkShrink.set(updatedItem);
                            linkShrink.save()
                            .then((result) => {
                                if (renderMode === 'enabled') {
                                    res.status(200).redirect(url.format({
                                        pathname: '/',
                                        query: {
                                            status: RequestResultStatusEnum.EDITING_SUCCESS
                                        }
                                    }))
                                } else {
                                    res.sendStatus(200);
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                if (renderMode === 'enabled') {
                                    res.status(400).redirect(url.format({
                                        pathname: '/',
                                        query: {
                                            status: RequestResultStatusEnum.EDITING_FAILED
                                        }
                                    }))
                                } else {
                                    res.sendStatus(400);
                                }
                            })
                        } else {
                            if (renderMode === 'enabled') {
                                res.status(400).redirect(url.format({
                                    pathname: '/',
                                    query: {
                                        status: RequestResultStatusEnum.EDITING_FAILED
                                    }
                                }))
                            } else {
                                res.sendStatus(400);
                            }
                        }
                    })
                } else {
                   updatedItem = { title, url: linkUrl };
                   if (linkShrink) {
                        linkShrink.set(updatedItem);
                        linkShrink.save()
                        .then((result) => {
                            if (renderMode === 'enabled') {
                                res.status(200).redirect(url.format({
                                    pathname: '/',
                                    query: {
                                        status: RequestResultStatusEnum.EDITING_SUCCESS
                                    }
                                }))
                            } else {
                                res.sendStatus(200);
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            if (renderMode === 'enabled') {
                                res.status(400).redirect(url.format({
                                    pathname: '/',
                                    query: {
                                        status: RequestResultStatusEnum.EDITING_FAILED
                                    }
                                }))
                            } else {
                                res.sendStatus(400);
                            }
                        })
                   } else {
                        if (renderMode === 'enabled') {
                            res.status(400).redirect(url.format({
                                pathname: '/',
                                query: {
                                    status: RequestResultStatusEnum.EDITING_FAILED
                                }
                            }))
                        } else {
                            res.sendStatus(400);
                        }
                   }
                }
            })
            .catch((err) => {
                console.log(err);
                if (renderMode === 'enabled') {
                    res.status(400).redirect(url.format({
                        pathname: '/',
                        query: {
                            status: RequestResultStatusEnum.EDITING_FAILED
                        }
                    }))
                } else {
                    res.sendStatus(400);
                }
            })
        }
    }

    private static getUUIDWithoutHyphens() {
        // URL hash will be a part of generated uuid hash without hyphens
        return uuidv4().replace(/-/g, "");
    }

    private static getNewUrlHash(): Promise<string> {
        // URL hash will be a part of generated uuid hash without hyphens
        const uuid = MainController.getUUIDWithoutHyphens();
        const shortURLhash = MainController.getShortUniqueUUID(uuid);
        return shortURLhash;
    }

    // We taking few first symbols from 
    private static getShortUniqueUUID(uuid: string, currentSize: number = MIN_URL_HASH_SIZE): Promise<string> {
        const newShortHash: string = uuid.slice(0, currentSize);

        // Due to short hash we need to check uniqueness of this hash in our data base
        return LinkShrink.findAndCountAll({where: {hash: newShortHash}})
        .then((resultCountObj) => {
            const existingUrlNumber = resultCountObj?.count ?? 0;
            if (!existingUrlNumber) {
                return Promise.resolve(newShortHash);
            } else {
                // We're increasing size of hash sub string in case if this hash already exist in database
                const newSize = currentSize + 1;
                if (newSize <= MAX_URL_HASH_SIZE) {
                    return MainController.getShortUniqueUUID(uuid, newSize);
                } else {
                    // If our size of sub string is max size of uuid,
                    // we need to generate new uuid and start from min size of substring
                    // (P.S. it's very unlikely that we can generate the same uuid, but let's add this case)
                    return MainController.getShortUniqueUUID(MainController.getUUIDWithoutHyphens());
                }
            }    
        })
    }
 }