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
    web3ProviderUrl = `ws://localhost:10000`;

    allWeb3Providers: Web3[]  = []; 

    public async stopListener() {
        for(let web3Provider of this.allWeb3Providers){
            web3Provider.eth.clearSubscriptions(function (error, result) {
                if (error) {
                    console.log(error);
                }
            });

            const indexOfObject = this.allWeb3Providers.findIndex((provider) => {
                return provider === web3Provider;
            });
    
            if (indexOfObject !== -1){
                this.allWeb3Providers.splice(indexOfObject, 1);
            } 
        } 
    }

    public async mintNFT(mintData: MintData) {

        try {

            if(mintData.test) {
                console.log("TEST MODE IS ACTIVE!!")
            } 

            console.log("Start creating wallets", new Date().toLocaleTimeString());

            const wallets: WalletData[] = walletPrivateKeysJson;

            if (!wallets || wallets.length === 0) {
                throw new Error("There are no wallets supplied. See readme!");
            }

            console.log("Wallets created. Starting with listening...", new Date().toLocaleTimeString());

            const web3Provider = new Web3(new Web3.providers.WebsocketProvider(this.web3ProviderUrl, require('net')));

            this.allWeb3Providers.push(web3Provider);

            web3Provider.eth.subscribe('pendingTransactions', function (error, result) {
                if (error) {
                    console.log(error);
                }
            }).on("data", (txHash) => {

                let txHashReceivedAt = new Date();

                web3Provider.eth.getTransaction(txHash).then(async fullTransaction => {

                    // TODO:
                    // anstatt dass der minting-methoden-hex 1:1 mit dem input der tx übereinstimmen muss auf contains umändern.
                    // es muss nur die methode übereinstimmen der rest ist egal
                    // tx zum testen: 0x55003c2ed30db729596413af90d1df84b5d9eb21b1cdc19a256a9558398334bd
                    if (fullTransaction?.to === mintData.contractAddress
                        && fullTransaction?.from === mintData.contractOwnerAddress
                        && fullTransaction?.input.includes(mintData.enableMintingMethodHex)) {

                        console.log("Transaction Hash Received", txHashReceivedAt);
                        console.log("Dev Transaction Received", new Date());

                        const maxPriorityFeePerGas = fullTransaction.maxPriorityFeePerGas;
                        const maxFeePerGas = fullTransaction.maxFeePerGas;

                        if (typeof maxPriorityFeePerGas != 'string') {
                            throw new Error("Max-Priority-Fee-Per-Gas could not be extracted. Aborting...");
                        } if (typeof maxFeePerGas != 'string') {
                            throw new Error("Max-Fee-Per-Gas could not be extracted. Aborting...");
                        }

                        if(mintData.test){
                            await this.sendTestTransactions(mintData, maxPriorityFeePerGas, maxFeePerGas, wallets, web3Provider)
                        } else{
                            await this.sendTransactions(mintData, maxPriorityFeePerGas, maxFeePerGas, wallets, web3Provider);
                        }

                        setTimeout(() => this.clearSubcriptions(web3Provider), 500);
                    }
                });
            });
        } catch (error) {
            console.error("Maybe you forgot to import and ulock the wallets in geth?")
            console.log(error);
        }
    }

    private async clearSubcriptions(web3Provider: Web3){
        await web3Provider.eth.clearSubscriptions(function (error, result) {
            if (error) {
                console.log(error);
            }
        });
        
        const indexOfObject = this.allWeb3Providers.findIndex((provider) => {
            return provider === web3Provider;
        });

        if (indexOfObject !== -1){
            this.allWeb3Providers.splice(indexOfObject, 1);
        } 

        console.log("Cleared Subsriptions", new Date())
    } 

    private async sendTransactions(mintData: MintData, maxPriorityFeePerGas: string, maxFeePerGas: string, wallets: WalletData[], web3Provider: Web3): Promise<void> {
        for (let wallet of wallets) {
            this.sendTransaction(mintData, maxPriorityFeePerGas, maxFeePerGas, wallet, web3Provider);
        }
        return Promise.resolve();
    }

    private async sendTestTransactions(mintData: MintData, maxPriorityFeePerGas: string, maxFeePerGas: string, wallets: WalletData[], web3Provider: Web3): Promise<void> {
        for (let wallet of wallets) {
            this.sendTestTransaction(mintData, maxPriorityFeePerGas, maxFeePerGas, wallet, web3Provider);
        }
        return Promise.resolve();
    }

    private async sendTransaction(mintData: MintData, maxPriorityFeePerGas: string, maxFeePerGas: string, wallet: WalletData, web3Provider: Web3) {

        console.log("Start sending tx", wallet.walletAddress, new Date());
 
        const transactionReceipt = await web3Provider.eth.sendTransaction(
            {
                from: wallet.walletAddress,
                to: mintData.contractAddress,
                data: mintData.mintFunctionHex,
                value: web3Provider.utils.toWei(mintData.price, 'ether'),
                gas: mintData.gasLimit,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas
            }
        );

        if (transactionReceipt) {
            console.log("Transaction was a success.", wallet.walletAddress, new Date());
        } else {
            console.log("There was an error with the transaction...", wallet.walletAddress, new Date());
        } 

        return Promise.resolve();
    }

    private async sendTestTransaction(mintData: MintData, maxPriorityFeePerGas: string, maxFeePerGas: string, wallet: WalletData, web3Provider: Web3) {

        console.log("Start sending test tx", wallet.walletAddress, new Date());
 
        const transactionReceipt = await web3Provider.eth.sendTransaction(
            {
                from: wallet.walletAddress,
                to: wallet.walletAddress,
                value: web3Provider.utils.toWei(mintData.price, 'ether'),
                gas: mintData.gasLimit,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas
            }
        );

        if (transactionReceipt) {
            console.log("Test Transaction was a success.", wallet.walletAddress, new Date());
        } else {
            console.log("There was an error with the test transaction...", wallet.walletAddress, new Date());
        } 

        return Promise.resolve();
    }

}

export default MinterService;
