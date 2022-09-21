import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import { providers, Wallet } from 'ethers';

class MinterService {

    // guarli network
    CHAIN_ID = 5;
    provider = new providers.InfuraProvider(this.CHAIN_ID);
    
    wallet: Wallet;

    constructor() {

        // TODO: möglichkeit einbauen mit mehreren wallets zu minten
        if(process.env.WALLET_PRIVATE_KEY) {
            this.wallet = new Wallet(process.env.WALLET_PRIVATE_KEY, this.provider);
        } else {
            console.error("Please provide WALLET_PRIVATE_KEY env");
            process.exit(1);
        }
    }

    async getBlockNumber() {
        return await this.provider.getBlockNumber();
    }

    async test() {
        
        this.provider.on('block', (blockNumber) => {
            console.log(blockNumber);
            
        });
    }
    
    async stopListener() {
        this.provider.removeAllListeners();
    }
}

export default MinterService;
