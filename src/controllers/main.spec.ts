import { LinkShrink } from "../models/linkShrink";
import { MainController } from "./main";

describe('MainController test', () => {
    it('should create short part of uuid with 4 symbols', (done) => {
        jest.spyOn(LinkShrink, 'findAndCountAll').mockResolvedValue({ rows: [], count: 0 } as any);
        MainController.getShortUniqueUUID('testuuidstring', 4)
        .then((newShortUUID) => {
            expect(newShortUUID).toBe('test');
            done();
        })
        .catch((err) =>  {
            done(err);
        })
    })

    it('should trigger redirect method with mock path', (done) => {
        jest.spyOn(LinkShrink, 'findOne').mockResolvedValue({ hash: 'testHash', url: 'testUrl' } as LinkShrink);

        const req = {
            params: {
                linkHash: 'testHash'
            }
        }
        const next = {};
        let res = {} as any;
        res.status = jest.fn(() => res);
        res.redirect = jest.fn((testUrl) => {
            expect(testUrl).toBe('testUrl');
            done();
        });
        MainController.checkLinkAndRedirect(req, res, next)
    })
})