import { ethers, providers, Wallet } from 'ethers';

class MinterService {

    // guarli network
    CHAIN_ID = 5;
    provider = new providers.InfuraProvider(this.CHAIN_ID);

    async getBlockNumber() {
        return await this.provider.getBlockNumber();
    }

    public async test() {

        this.provider.on('block', (blockNumber) => {
            console.log(blockNumber);

        });
    }

    public async stopListener() {
        this.provider.removeAllListeners();
    }

    public async mintNFT(walletPrivateKey: string, contractAddress: string, contractMethodHex: string, price: string, gasLimit: string) {

        try {

            // TODO: mit elias sein node netzwerk verbinden
            // TODO: warten auf dev

            const wallet = await this.getWallet(walletPrivateKey);
            const nonce = await this.getNonce(wallet);
            const gasPrice = (await this.getCurrentGasPrice()).gasPrice;

            if (!gasPrice) {
                throw new Error("No Gas Price could be calculated");
            }

            console.log("Before transaction");

            console.log("Gas Price", gasPrice.toNumber());

            console.log("Gas Price", ethers.utils.formatUnits(gasPrice, "gwei"));

            const transaction = await wallet.sendTransaction({
                to: contractAddress,
                value: ethers.utils.parseEther(price),
                data: contractMethodHex,
                gasLimit: gasLimit,
                gasPrice: gasPrice,
                nonce: nonce
            });

            console.log("After transaction");

            const receipt = await transaction.wait();

            if(receipt) {
                console.log("Success");
                console.log(receipt);
            } else {
                console.log("Error");
            }

            console.log("finished");


        } catch (error) {
            console.log(error);

        }

    }

    private async getWallet(walletPrivateKey: string) {
        return await new ethers.Wallet(walletPrivateKey, this.provider);
    }
    private async getNonce(wallet: ethers.Wallet) {
        return (await wallet).getTransactionCount();
    }
    private async getCurrentGasPrice() {
        return (await this.provider.getFeeData());
    }

}

export default MinterService;
