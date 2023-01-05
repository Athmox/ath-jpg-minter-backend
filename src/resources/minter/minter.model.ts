export interface MintData {
    contractAddress: string,
    mintFunctionHex: string,
    price: string,
    gasLimit: string,
    test: boolean;
}

export interface MintDataWithGasFees extends MintData {
    maxPriorityFeePerGas: number,
    maxFeePerGas: number;
} 

export interface MintDataFlipState extends MintData {
    contractOwnerAddress: string,
    enableMintingMethodHex: string;
}

export interface MintDataSpecificTime extends MintDataWithGasFees {
    mintDateInMillis: number;
}

export interface MintDataInstant extends MintDataWithGasFees{

} 