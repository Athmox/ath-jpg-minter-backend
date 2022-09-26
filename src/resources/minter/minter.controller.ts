import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import MinterService from './minter.service';

export class MinterController implements Controller {
    public path = '/minter';
    public router = Router();
    private minterService = new MinterService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(
            `${this.path}/getBlockNumber`,
            this.getBlockNumber
        );
        this.router.get(
            `${this.path}/startTest`,
            this.startTest
        );
        this.router.get(
            `${this.path}/stopListener`,
            this.stopListener
        );
        this.router.post(
            `${this.path}/mintNft`,
            this.mintNft
        );
    }

    private getBlockNumber = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {

            const blockNumber = await this.minterService.getBlockNumber();

            res.status(201).json({ blockNumber });
        } catch (error) {
            next(new HttpException(400, 'Cannot create request'));
        }
    };

    private startTest = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            
            await this.minterService.test();

            res.status(201).json({ "test-gestartet": true });
        } catch (error) {
            next(new HttpException(400, 'Cannot create request'));
        }
    };

    private stopListener = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            
            await this.minterService.stopListener();

            res.status(201).json({ "test-gestoppt": true });
        } catch (error) {
            next(new HttpException(400, 'Cannot create request'));
        }
    };

    private mintNft = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("HI");

            const { walletPrivateKey, contractAddress, contractMethodHex, price, gasLimit } = req.body;

            await this.minterService.mintNFT(walletPrivateKey, contractAddress, contractMethodHex, price, gasLimit);

            res.status(201).json({ succes: true });
        } catch (error) {
            next(new HttpException(400, 'Cannot create post'));
        }
    };
}
