import { MintData } from './minter.model';
import walletPrivateKeysJson from '../../../wallet-private-keys.json';
import Web3 from 'web3';

export interface WalletData {
    walletAddress: string,
    walletPrivateKey: string
}

class MinterService {

    // Elias Node MAINNET
    // alchemyProvider = new providers.WebSocketProvider("wss://eth-mainnet.alchemyapi.io/v2/Il9ArCAii0Je4em_h86S98925ApXnqeS");

    // IPC
    // sometimes it disconnected for no reason...
    // web3Provider = new Web3(new Web3.providers.IpcProvider(`/var/lib/geth/geth.ipc`, require('net')));
    
    // Websockets
    web3Provider = new Web3(new Web3.providers.WebsocketProvider(`ws://localhost:10000`, require('net')));

    public async stopListener() {
        this.web3Provider.eth.clearSubscriptions(function (error, result) {
            if (error) {
                console.log(error);
            }
        });
    }

    public async mintNFT(mintData: MintData) {

        try {

            console.log("Start creating wallets", new Date().toLocaleTimeString());

            const wallets: WalletData[] = walletPrivateKeysJson;

            if (!wallets || wallets.length === 0) {
                throw new Error("There are no wallets supplied. See readme!");
            }

            console.log("Wallets created. Starting with listening...", new Date().toLocaleTimeString());

            this.web3Provider.eth.subscribe('pendingTransactions', function (error, result) {
                if (error) {
                    console.log(error);
                }
            }).on("data", (txHash) => {

                this.web3Provider.eth.getTransaction(txHash).then(fullTransaction => {

                    if (fullTransaction?.to === mintData.contractAddress
                        && fullTransaction?.from === mintData.contractOwnerAddress
                        && fullTransaction?.input === mintData.enableMintingMethodHex) {

                        console.log(fullTransaction, new Date());

                        this.web3Provider.eth.clearSubscriptions(function (error, result) {
                            if (error) {
                                console.log(error);
                            }
                        });

                        console.log("Cleared Subsriptions", new Date())

                        const maxPriorityFeePerGas = fullTransaction.maxPriorityFeePerGas;
                        const maxFeePerGas = fullTransaction.maxFeePerGas;

                        if (typeof maxPriorityFeePerGas != 'string') {
                            throw new Error("Max-Priority-Fee-Per-Gas could not be extracted. Aborting...");
                        } if (typeof maxFeePerGas != 'string') {
                            throw new Error("Max-Fee-Per-Gas could not be extracted. Aborting...");
                        }

                        this.sendTransactions(mintData, maxPriorityFeePerGas, maxFeePerGas, wallets);
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }
    }

    private async sendTransactions(mintData: MintData, maxPriorityFeePerGas: string, maxFeePerGas: string, wallets: WalletData[]) {
        for (let wallet of wallets) {
            this.sendTransaction(mintData, maxPriorityFeePerGas, maxFeePerGas, wallet);
        }
    }

    private async sendTransaction(mintData: MintData, maxPriorityFeePerGas: string, maxFeePerGas: string, wallet: WalletData) {

        console.log("Start signing tx", wallet.walletAddress, new Date());

        const signedTransaction = await this.web3Provider.eth.accounts.signTransaction(
            {
                to: mintData.contractAddress,
                data: mintData.mintFunctionHex,
                value: this.web3Provider.utils.toWei(mintData.price, 'ether'),
                gas: mintData.gasLimit,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas
            }, wallet.walletPrivateKey
        );

        // https://ethereum.stackexchange.com/questions/38034/using-sendtransaction-in-web3-js
        // unsigned tx schicken mit web3Provider.eth.getAccouts[0] 
 
        /* const signedTransaction = await this.web3Provider.eth.sendTransaction(
            {
                from: wallet.walletAddress,
                to: mintData.contractAddress,
                data: mintData.mintFunctionHex,
                value: this.web3Provider.utils.toWei(mintData.price, 'ether'),
                gas: mintData.gasLimit,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas
            }
        ); */

        if (typeof signedTransaction.rawTransaction != 'string') {
            throw new Error("Could not sign tx. Aborting...");
        } 

        console.log("Tx signed", wallet.walletAddress, new Date());

        console.log("Sending tx... Waiting for receipt...", wallet.walletAddress, new Date()); 

        const receipt = await this.web3Provider.eth.sendSignedTransaction(signedTransaction.rawTransaction);

        if (receipt) {
            console.log("Transaction was a success.", wallet.walletAddress, new Date());
            console.log(receipt);
        } else {
            console.log("There was an error with the transaction...", wallet.walletAddress, new Date());
        } 

        return Promise.resolve();
    }

}

export default MinterService;
