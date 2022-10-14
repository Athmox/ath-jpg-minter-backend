import { BigNumber, ethers, providers, Wallet } from 'ethers';
import { MintData } from './minter.model';
import walletPrivateKeysJson from '../../../wallet-private-keys.json';

class MinterService {

    // Elias Node MAINNET
    provider = new providers.WebSocketProvider("wss://eth-mainnet.alchemyapi.io/v2/Il9ArCAii0Je4em_h86S98925ApXnqeS");

    // Localhost
    // provider = new providers.IpcProvider(`TODO`);

    public async stopListener() {
        this.provider.removeAllListeners();
    }

    public async mintNFT(mintData: MintData) {

        try {

            console.log("Start creating wallets", new Date().toLocaleTimeString());

            const walletPrivateKeys: string[] = walletPrivateKeysJson;

            if (!walletPrivateKeys || walletPrivateKeys.length === 0) {
                throw new Error("There are no wallet private Keys supplied. See readme!");
            }

            const wallets = await this.getWallets(walletPrivateKeys);

            console.log("Wallets created. Starting with listening...", new Date().toLocaleTimeString());

            this.provider.removeAllListeners();

            let prov2 = 1;

            // this.provider2.on("pending", async (tx) => {
                
                //     console.log("2: ", prov2);
                
                //     prov2 = prov2 + 1;
            // });

            let prov1 = 0;
            
            this.provider.on("pending", async (tx) => {

                // prov1 = prov1 + 1;

                // console.log("1: ", prov1);

                console.log(tx.hash);

                // sometimes only identifier is send and sometimes full tx.
                // header is send with websockets, full tx is send with jsonRpcProvider

                /* this.provider.getTransaction(tx).then(developerTransaction => {
                    console.log(developerTransaction);
                    if (developerTransaction?.to === mintData.contractAddress
                        && developerTransaction?.from === mintData.contractOwnerAddress
                        && developerTransaction?.data === mintData.enableMintingMethodHex) {
                        

                        this.provider.removeAllListeners();
                        const maxPriorityFeePerGas = developerTransaction.maxPriorityFeePerGas;
                        const maxFeePerGas = developerTransaction.maxFeePerGas;

                        if (!maxPriorityFeePerGas) {
                            throw new Error("Max-Priority-Fee-Per-Gas could not be extracted. Aborting...");
                        } if (!maxFeePerGas) {
                            throw new Error("Max-Fee-Per-Gas could not be extracted. Aborting...");
                        }

                         this.sendTransactions(mintData, maxPriorityFeePerGas, maxFeePerGas, wallets);
                    }
                }); */
            });
        } catch (error) {
            console.log(error);
        }
    }

    private async sendTransactions(mintData: MintData, maxPriorityFeePerGas: BigNumber, maxFeePerGas: BigNumber, wallets: Wallet[]) {
        for (let wallet of wallets) {
            this.sendTransaction(mintData, maxPriorityFeePerGas, maxFeePerGas, wallet);
        }
    }

    private async sendTransaction(mintData: MintData, maxPriorityFeePerGas: BigNumber, maxFeePerGas: BigNumber, wallet: Wallet) {

        console.log("Sending Transaction", wallet.getAddress(), new Date().toLocaleTimeString());

        const transaction = await wallet.sendTransaction({
            to: mintData.contractAddress,
            data: mintData.mintFunctionHex,
            value: ethers.utils.parseEther(mintData.price),
            gasLimit: mintData.gasLimit,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            maxFeePerGas: maxFeePerGas,
        });

        console.log("Transaction successfully sent. Waiting for receipt...", wallet.getAddress(), new Date().toLocaleTimeString());

        const receipt = await transaction.wait();

        if (receipt) {
            console.log("Transaction was a success.", wallet.getAddress(), new Date().toLocaleTimeString());
            console.log(receipt);
        } else {
            console.log("There was an error with the transaction...", wallet.getAddress(), new Date().toLocaleTimeString());
        }

        return Promise.resolve();
    }

    private async getWallets(walletPrivateKeys: string[]): Promise<ethers.Wallet[]> {
        const wallets: ethers.Wallet[] = [];
        for (let walletPrivateKey of walletPrivateKeys) {
            wallets.push(await this.getWallet(walletPrivateKey));
        }
        return wallets;
    }

    private async getWallet(walletPrivateKey: string): Promise<ethers.Wallet> {
        return new ethers.Wallet(walletPrivateKey, this.provider);
    }

}

export default MinterService;
