import { ethers, providers, Wallet } from 'ethers';

class MinterService {

    // Elias Node MAINNET
    // provider = new providers.JsonRpcProvider("https://connect.deltaoutpost.io/mainnet/2i6f1nn21jjq");
    // provider = new providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/Il9ArCAii0Je4em_h86S98925ApXnqeS");
    
    // Markus NODE GUARLI
    provider = new providers.WebSocketProvider(`wss://virulent-damp-frog.ethereum-goerli.discover.quiknode.pro/1255b041b365c785e2e0dc6b2f2b77280c1f1724/`);

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

            console.log("Started listening");

            this.provider.on("pending", async (tx) => {
                this.provider.getTransaction(tx).then(transaction => {
                    if(transaction.to === contractAddress) {
                        console.log(transaction);
                    }
                });
            });



            // contract.on("Transfer", (from, to, tokenId, event) => {
            //     console.log("Transfer");
            //     const info = {
            //         from,
            //         to,
            //         tokenId,
            //         event
            //     }
            //     console.log("Event Result: ", info);
            //     this.getEventProperties(event);
            // });




            // const wallet = await this.getWallet(walletPrivateKey);
            // const nonce = await this.getNonce(wallet);
            // const gasPrice = (await this.getCurrentGasPrice()).gasPrice;

            // if (!gasPrice) {
            //     throw new Error("No Gas Price could be calculated");
            // }

            // console.log("Before transaction");

            // console.log("Gas Price", gasPrice.toNumber());

            // console.log("Gas Price", ethers.utils.formatUnits(gasPrice, "gwei"));

            // const transaction = await wallet.sendTransaction({
            //     to: contractAddress,
            //     value: ethers.utils.parseEther(price),
            //     data: contractMethodHex,
            //     gasLimit: gasLimit,
            //     gasPrice: gasPrice,
            //     nonce: nonce
            // });

            // console.log("After transaction");

            // const receipt = await transaction.wait();

            // if(receipt) {
            //     console.log("Success");
            //     console.log(receipt);
            // } else {
            //     console.log("Error");
            // }

            // console.log("finished");


        } catch (error) {
            console.log(error);

        }

    }

    private async getEventProperties(event: any) {

        console.log("getTransaction", await event.getTransaction());
        console.log("getTransactionReceipt", await event.getTransactionReceipt());
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
