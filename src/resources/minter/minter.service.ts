import { BigNumber, ethers, providers, Wallet } from 'ethers';
import { MintData } from './minter.model';

class MinterService {

    // Elias Node MAINNET
    // provider = new providers.WebSocketProvider("wss://connect.deltaoutpost.io/mainnet/2i6f1nn21jjq");
    provider = new providers.WebSocketProvider("wss://eth-mainnet.alchemyapi.io/v2/Il9ArCAii0Je4em_h86S98925ApXnqeS");
    // provider = new providers.WebSocketProvider(`wss://falling-autumn-theorem.discover.quiknode.pro/3fa3a0696a7334ecdf91c3bbfce1417f45f5c4f8/`);
    

    // Markus NODE GUARLI
    // provider = new providers.WebSocketProvider(`wss://virulent-damp-frog.ethereum-goerli.discover.quiknode.pro/1255b041b365c785e2e0dc6b2f2b77280c1f1724/`);



    public async stopListener() {
        this.provider.removeAllListeners();
    }

    public async mintNFT(mintData: MintData) {


        // TODO: 
        // Postrequest mintFunctionHex umbenennen auf openContractMethodHex
        // contractMethodHex umbenennen auf mintFunctionHex

        try {
            console.log("Started listening", new Date().toLocaleTimeString());

            const wallet = await this.getWallet(mintData.walletPrivateKey);

            this.provider.on("pending", async (tx) => {
                this.provider.getTransaction(tx).then(developerTransaction => {
                    if (developerTransaction?.to === mintData.contractAddress && developerTransaction?.data === mintData.mintFunctionHex) {
                        console.log(developerTransaction);
                        const maxPriorityFeePerGas = developerTransaction.maxPriorityFeePerGas;
                        const maxFeePerGas = developerTransaction.maxFeePerGas;

                        if (!maxPriorityFeePerGas) {
                            throw new Error("Max-Priority-Fee-Per-Gas could not be extracted. Aborting...");
                        } if (!maxFeePerGas) {
                            throw new Error("Max-Fee-Per-Gas could not be extracted. Aborting...");
                        }

                        this.sendTransaction(mintData, maxPriorityFeePerGas, maxFeePerGas, wallet);
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }
    }

    private async sendTransaction(mintData: MintData, maxPriorityFeePerGas: BigNumber, maxFeePerGas: BigNumber, wallet: Wallet) {

        console.log("Sending Transaction", new Date().toLocaleTimeString());

        const transaction = await wallet.sendTransaction({
            to: mintData.contractAddress,
            value: ethers.utils.parseEther(mintData.price),
            data: mintData.contractMethodHex,
            gasLimit: mintData.gasLimit,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            maxFeePerGas: maxFeePerGas,
        });
        // nonce: await this.getNonce(wallet)
        // gasPrice: gasPrice,

        console.log("Transaction successfully sent. Waiting for receipt...", new Date().toLocaleTimeString());

        const receipt = await transaction.wait();

        if (receipt) {
            console.log("Transaction was a success.");
            console.log(receipt);
        } else {
            console.log("There was an error with the transaction...");
        }

        return Promise.resolve();
    }

    private async getWallet(walletPrivateKey: string) {
        return await new ethers.Wallet(walletPrivateKey, this.provider);
    }
    private async getNonce(wallet: ethers.Wallet) {
        return (await wallet).getTransactionCount();
    }

}

export default MinterService;
