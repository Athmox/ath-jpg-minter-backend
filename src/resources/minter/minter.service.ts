import { MintData, MintDataFlipState, MintDataInstant, MintDataSpecificTime } from './minter.model';
import walletPrivateKeysJson from '../../../wallet-private-keys.json';
import Web3 from 'web3';

export interface WalletData {
    walletAddress: string,
    walletPrivateKey: string,
    walletPassphrase: string,
    useForMint: boolean
}

class MinterService {

    // Elias Node MAINNET
    // web3ProviderUrl = `ws://eth-mainnet.alchemyapi.io/v2/Il9ArCAii0Je4em_h86S98925ApXnqeS`;

    // IPC
    // sometimes it disconnected for no reason...
    // web3Provider = new Web3(new Web3.providers.IpcProvider(`/var/lib/geth/geth.ipc`, require('net')));

    // Websockets
    web3ProviderUrl = `ws://localhost:10000`;

    allWeb3Providers: Web3[] = [];

    public async stopListener() {
        for (let web3Provider of this.allWeb3Providers) {
            web3Provider.eth.clearSubscriptions(function (error, result) {
                if (error) {
                    console.log(error);
                }
            });

            const indexOfObject = this.allWeb3Providers.findIndex((provider) => {
                return provider === web3Provider;
            });

            if (indexOfObject !== -1) {
                this.allWeb3Providers.splice(indexOfObject, 1);
            }
        }
    }

    private getWalletsForMint(): WalletData[] {

        const allWallets: WalletData[] = walletPrivateKeysJson;

        const wallets = allWallets.filter(wallet => wallet.useForMint == true);

        if (!wallets || wallets.length === 0) {
            throw new Error("There are no wallets supplied. See readme!");
        }

        console.log("Wallets used for mint", wallets.map(wallet => wallet.walletAddress));

        return wallets;
    }

    public async mintNFTAtSpecificTimeInMillis(mintDataSpecificTime: MintDataSpecificTime) {

        try {

            if (mintDataSpecificTime.test) {
                console.log("TEST MODE IS ACTIVE!!")
            }

            if (Number(mintDataSpecificTime.maxFeePerGas) >= 200 ||
                Number(mintDataSpecificTime.maxPriorityFeePerGas) >= 200) {

                console.log("The tx seems to need more Gas than usual. Be sure to write maxFeePerGas and maxPriorityFeePerGas in GWEI format!");
            }

            const wallets = this.getWalletsForMint();

            console.log("Mint will start at UTC Time", new Date(Number(mintDataSpecificTime.mintDateInMillis)));

            const web3Provider = new Web3(new Web3.providers.WebsocketProvider(this.web3ProviderUrl, require('net')));

            this.allWeb3Providers.push(web3Provider);

            const currentTimeInMillis = new Date().getTime();

            if (currentTimeInMillis >= mintDataSpecificTime.mintDateInMillis) {
                throw new Error("Mint timepoint must be in the future!");
            }

            setTimeout(() => {
                console.log("Time reached, start minting", new Date());
                if (mintDataSpecificTime.test) {
                    this.sendTestTransactions(
                        mintDataSpecificTime,
                        web3Provider.utils.toWei(mintDataSpecificTime.maxPriorityFeePerGas.toString(), 'Gwei'),
                        web3Provider.utils.toWei(mintDataSpecificTime.maxFeePerGas.toString(), 'Gwei'),
                        wallets,
                        web3Provider)
                } else {
                    this.sendTransactions(
                        mintDataSpecificTime,
                        mintDataSpecificTime.maxPriorityFeePerGas.toString(),
                        mintDataSpecificTime.maxFeePerGas.toString(),
                        wallets,
                        web3Provider);
                }
            }, mintDataSpecificTime.mintDateInMillis - new Date().getTime())


        } catch (error) {
            console.log(error);
        }
    }

    public async mintNFTInstant(mintData: MintDataInstant) {

        try {

            if (mintData.test) {
                console.log("TEST MODE IS ACTIVE!!")
            }

            if (Number(mintData.maxFeePerGas) >= 200 ||
                Number(mintData.maxPriorityFeePerGas) >= 200) {

                console.log("The tx seems to need more Gas than usual. Be sure to write maxFeePerGas and maxPriorityFeePerGas in GWEI format!");
            }

            const wallets = this.getWalletsForMint();

            const web3Provider = new Web3(new Web3.providers.WebsocketProvider(this.web3ProviderUrl, require('net')));

            this.allWeb3Providers.push(web3Provider);

            if (mintData.test) {
                this.sendTestTransactions(
                    mintData,
                    web3Provider.utils.toWei(mintData.maxPriorityFeePerGas.toString(), 'Gwei'),
                    web3Provider.utils.toWei(mintData.maxFeePerGas.toString(), 'Gwei'),
                    wallets,
                    web3Provider)
            } else {
                this.sendTransactions(
                    mintData,
                    mintData.maxPriorityFeePerGas.toString(),
                    mintData.maxFeePerGas.toString(),
                    wallets,
                    web3Provider);
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    public async mintNFT(mintDataFlipState: MintDataFlipState) {

        try {

            if (mintDataFlipState.test) {
                console.log("TEST MODE IS ACTIVE!!")
            }

            const wallets = this.getWalletsForMint();

            const web3Provider = new Web3(new Web3.providers.WebsocketProvider(this.web3ProviderUrl, require('net')));

            this.allWeb3Providers.push(web3Provider);

            web3Provider.eth.subscribe('pendingTransactions', function (error, result) {
                if (error) {
                    console.log(error);
                }
            }).on("data", (txHash) => {

                let txHashReceivedAt = new Date();

                web3Provider.eth.getTransaction(txHash).then(async fullTransaction => {

                    if (fullTransaction?.to === mintDataFlipState.contractAddress
                        && fullTransaction?.from === mintDataFlipState.contractOwnerAddress
                        && fullTransaction?.input.includes(mintDataFlipState.enableMintingMethodHex)) {

                        console.log("Transaction Hash Received", txHashReceivedAt);
                        console.log("Dev Transaction Received", new Date());

                        const maxPriorityFeePerGas = fullTransaction.maxPriorityFeePerGas;
                        const maxFeePerGas = fullTransaction.maxFeePerGas;

                        if (typeof maxPriorityFeePerGas != 'string') {
                            throw new Error("Max-Priority-Fee-Per-Gas could not be extracted. Aborting...");
                        } if (typeof maxFeePerGas != 'string') {
                            throw new Error("Max-Fee-Per-Gas could not be extracted. Aborting...");
                        }

                        if (mintDataFlipState.test) {
                            await this.sendTestTransactions(mintDataFlipState, maxPriorityFeePerGas, maxFeePerGas, wallets, web3Provider)
                        } else {
                            await this.sendTransactions(mintDataFlipState, maxPriorityFeePerGas, maxFeePerGas, wallets, web3Provider);
                        }

                        setTimeout(() => this.clearSubcriptions(web3Provider), 500);
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }
    }

    private async clearSubcriptions(web3Provider: Web3) {
        await web3Provider.eth.clearSubscriptions(function (error, result) {
            if (error) {
                console.log(error);
            }
        });

        const indexOfObject = this.allWeb3Providers.findIndex((provider) => {
            return provider === web3Provider;
        });

        if (indexOfObject !== -1) {
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

    public async bulkImportAccountWithRawKey() {

        const web3Provider = new Web3(new Web3.providers.WebsocketProvider(this.web3ProviderUrl, require('net')));

        this.allWeb3Providers.push(web3Provider);

        const allWallets: WalletData[] = walletPrivateKeysJson;

        for(let wallet of allWallets){
            if(wallet.useForMint){
                await this.importAccountWithRawKey(web3Provider, wallet.walletPrivateKey, wallet.walletPassphrase);
            } 
        } 

        this.clearSubcriptions(web3Provider);
    }
    
    private async importAccountWithRawKey(web3Provider: Web3, walletPrivateKey: string, walletPassphrase: string) {
        
        await web3Provider.eth.personal.importRawKey(walletPrivateKey, walletPassphrase).then(res => console.log("Wallet imported", res));
    }
    
    public async bulkUnlockAccount() {

        const web3Provider = new Web3(new Web3.providers.WebsocketProvider(this.web3ProviderUrl, require('net')));

        this.allWeb3Providers.push(web3Provider);

        const allWallets: WalletData[] = walletPrivateKeysJson;

        for(let wallet of allWallets){
            if(wallet.useForMint){
                await this.unlockAccount(web3Provider, wallet.walletAddress, wallet.walletPassphrase);
            } 
        } 

        this.clearSubcriptions(web3Provider);
    }

    private async unlockAccount(web3Provider: Web3, walletAddress: string, walletPassphrase: string) {

        await web3Provider.eth.personal.unlockAccount(walletAddress, walletPassphrase, 0).then(res => console.log("Wallet unlocked", walletAddress));
    }

}

export default MinterService;
