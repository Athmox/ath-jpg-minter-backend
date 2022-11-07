export interface MintData {
    contractAddress: string,
    mintFunctionHex: string,
    price: string,
    gasLimit: string,
    test: boolean;
}

export interface MintDataFlipState extends MintData {
    contractOwnerAddress: string,
    enableMintingMethodHex: string;
}

export interface MintDataSpecificTime extends MintData {
    maxPriorityFeePerGas: number,
    maxFeePerGas: number,
    mintDateInMillis: number;
}