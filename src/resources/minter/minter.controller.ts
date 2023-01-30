import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import MinterService from './minter.service';
import { MintDataFlipState, MintDataInstant, MintDataSpecificTime } from './minter.model';

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
        this.router.post(
            `${this.path}/mintNFTAtSpecificTimeInMillis`,
            this.mintNFTAtSpecificTimeInMillis
        );
        this.router.post(
            `${this.path}/mintNFTInstant`,
            this.mintNFTInstant
        );
        this.router.get(
            `${this.path}/bulkImportAccountWithRawKey`,
            this.bulkImportAccountWithRawKey
        );
        this.router.get(
            `${this.path}/bulkUnlockAccount`,
            this.bulkUnlockAccount
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
            const { contractAddress, contractOwnerAddress, mintFunctionHex, price, gasLimit, enableMintingMethodHex, test } = req.body;

            if (!contractAddress || !contractOwnerAddress || !mintFunctionHex || !price || !gasLimit || !enableMintingMethodHex) {

                res.status(400).json({ errorMessage: "Cannot start listening, because not all parameters are set!" });
            } else {

                const mintData: MintDataFlipState = {
                    contractAddress,
                    contractOwnerAddress,
                    mintFunctionHex,
                    price,
                    gasLimit,
                    enableMintingMethodHex,
                    test
                }

                this.minterService.mintNFT(mintData);

                res.status(201).json({ startedListening: true });
            }
        } catch (error) {
            next(new HttpException(400, 'Cannot create post'));
        }
    };

    private mintNFTAtSpecificTimeInMillis = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { contractAddress, mintFunctionHex, price, gasLimit, test, maxPriorityFeePerGas, maxFeePerGas, mintDateInMillis } = req.body;

            if (!contractAddress || !mintFunctionHex || !price || !gasLimit || !test || !maxPriorityFeePerGas || !maxFeePerGas || !mintDateInMillis) {

                res.status(400).json({ errorMessage: "Cannot start minting process at specific time, because not all parameters are set!" });
            } else {

                const mintData: MintDataSpecificTime = {
                    contractAddress,
                    mintFunctionHex,
                    price,
                    gasLimit,
                    test,
                    maxPriorityFeePerGas,
                    maxFeePerGas,
                    mintDateInMillis
                }

                this.minterService.mintNFTAtSpecificTimeInMillis(mintData);

                res.status(201).json({ startedMintingProcessAtSpecificTime: true });
            }
        } catch (error) {
            next(new HttpException(400, 'Cannot create post'));
        }
    };

    private mintNFTInstant = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { contractAddress, mintFunctionHex, price, gasLimit, test, maxPriorityFeePerGas, maxFeePerGas } = req.body;

            if (!contractAddress || !mintFunctionHex || !price || !gasLimit || !maxPriorityFeePerGas || !maxFeePerGas ) {

                res.status(400).json({ errorMessage: "Cannot start minting process at specific time, because not all parameters are set!" });
            } else {

                const mintData: MintDataInstant = {
                    contractAddress,
                    mintFunctionHex,
                    price,
                    gasLimit,
                    test,
                    maxPriorityFeePerGas,
                    maxFeePerGas
                }

                this.minterService.mintNFTInstant(mintData);

                res.status(201).json({ startedMintingProcessInstant: true });
            }
        } catch (error) {
            next(new HttpException(400, 'Cannot create post'));
        }
    };

    private bulkImportAccountWithRawKey = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {

            this.minterService.bulkImportAccountWithRawKey();

            res.status(201).json({ bulkImportAccountWithRawKey: true });

        } catch (error) {
            next(new HttpException(400, 'Cannot create post'));
        }
    };

    private bulkUnlockAccount = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {

            this.minterService.bulkUnlockAccount();

            res.status(201).json({ bulkUnlockAccount: true });

        } catch (error) {
            next(new HttpException(400, 'Cannot create post'));
        }
    };
}
