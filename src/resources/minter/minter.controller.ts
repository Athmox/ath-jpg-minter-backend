import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import MinterService from './minter.service';
import { MintData } from './minter.model';

export class MinterController implements Controller {
    public path = '/minter';
    public router = Router();
    private minterService = new MinterService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(
            `${this.path}/stopListener`,
            this.stopListener
        );
        this.router.post(
            `${this.path}/mintNft`,
            this.mintNft
        );
    }

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
            const { walletPrivateKey, contractAddress, contractOwnerAddress, mintFunctionHex, price, gasLimit, enableMintingMethodHex } = req.body;

            if (!walletPrivateKey || !contractAddress || !mintFunctionHex || !price || !gasLimit || !enableMintingMethodHex) {
                
                res.status(400).json({ errorMessage: "Cannot start listening, because not all parameters are set!" });
            } else {

                const mintData: MintData = {
                    walletPrivateKey,
                    contractAddress,
                    contractOwnerAddress,
                    mintFunctionHex,
                    price,
                    gasLimit,
                    enableMintingMethodHex
                }

                this.minterService.mintNFT(mintData);

                res.status(201).json({ startedListening: true });
            }
        } catch (error) {
            next(new HttpException(400, 'Cannot create post'));
        }
    };
}
