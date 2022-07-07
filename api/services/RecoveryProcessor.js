const {
    FlashbotsBundleProvider,
    FlashbotsBundleResolution,
} = require("@flashbots/ethers-provider-bundle");
const ethers = require('ethers');

const BLOCKS_IN_THE_FUTURE = 1;

const GWEI = ethers.BigNumber.from(10).pow(9);
const PRIORITY_GAS_PRICE = GWEI.mul(31);

const ERC721_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "from", "type": "address" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "bytes", "name": "data", "type": "bytes" }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const ERC1155_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "from", "type": "address" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "bytes", "name": "data", "type": "bytes" }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

const TRANSACTION_DATA = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('SCOOPER'))

class RecoveryProcessor {
    constructor(
        blockNumber,
        live,
        compromisedWalletPrivateKey,
        compromisedWalletBalance,
        sponsorWalletPrivateKey,
        sponsorWalletBalance,
        transactions,
        bundleGasEstimate
    ) {
        this.blockNumber = blockNumber;
        this.live = live;

        this.compromisedWalletPrivateKey = compromisedWalletPrivateKey;
        this.compromisedWalletBalance = compromisedWalletBalance;
        this.sponsorWalletPrivateKey = sponsorWalletPrivateKey;
        this.sponsorWalletBalance = sponsorWalletBalance;
        this.transactions = transactions;
        this.bundleGasEstimate = bundleGasEstimate;

        this.compromisedWallet = new ethers.Wallet(
            this.compromisedWalletPrivateKey,
            ethers.getDefaultProvider()
        );

        this.sponsorWallet = new ethers.Wallet(
            this.sponsorWalletPrivateKey,
            ethers.getDefaultProvider()
        )
    }

    determineTargetBlock = (blockNumber) => {
        return blockNumber + BLOCKS_IN_THE_FUTURE;
    };

    connectedContract = (transaction, provider) => {
        return new ethers.Contract(
            transaction.token_address,
            transaction.contract_type === 'ERC721' ? ERC721_ABI : ERC1155_ABI,
            provider
        );
    };

    // get a simulated on-chain response for gas estimation
    estimateGasOnChain = async (
        connectedTokenContract,
        transaction,
        options,
        functionName
    ) => {
        if (transaction.contract_type === 'ERC721')
            return await connectedTokenContract.estimateGas[functionName](
                this.compromisedWallet.address,
                transaction.recipient,
                transaction.token_id,
                TRANSACTION_DATA,
                options
            );

        // 1155 Support.
        return await connectedTokenContract.estimateGas[functionName](
            this.compromisedWallet.address,
            transaction.recipient,
            transaction.token_id,
            transaction.amount,
            TRANSACTION_DATA,
            options
        )
    };

    populateTransaction = (
        connectedTokenContract,
        transaction,
        options,
        functionName
    ) => {
        if (transaction.contract_type === 'ERC721')
            return connectedTokenContract.populateTransaction[functionName](
                this.compromisedWallet.address,
                transaction.recipient,
                transaction.token_id,
                TRANSACTION_DATA,
                options
            );

        // 1155 Support.
        return connectedTokenContract.populateTransaction[functionName](
            this.compromisedWallet.address,
            transaction.recipient,
            transaction.token_id,
            transaction.amount,
            TRANSACTION_DATA,
            options
        )
    };

    buildTransaction = (
        block,
        transaction,
        populateTx,
        gasEstimate
    ) => {
        const maxBaseFeeInFutureBlock = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
            block.baseFeePerGas,
            1
        );

        const multiplier = transaction.priorityFeeMultiplier
            ? transaction.priorityFeeMultiplier
            : 2;
        const priorityFee = GWEI.mul(multiplier);

        return {
            to: transaction.token_address,
            type: 2,
            maxFeePerGas: priorityFee.add(maxBaseFeeInFutureBlock),
            maxPriorityFeePerGas: priorityFee,
            gasLimit: gasEstimate == null || gasEstimate < 42000 ? 42000 : gasEstimate,
            data: populateTx.data,
            value: 0,
            chainId: 1,
        };
    };

    // determines how much eth is needed to cover the bundle
    getBundleSimulationGas = () => {
        // if we haven't run the simulation yet, use the 90% of the balance
        if (this.bundleGasEstimate === 0) return Math.floor(
            this.sponsorWalletBalance.formatted * GWEI * 0.9
        );

        // return the gas that was used in the simulated bundle
        return this.bundleGasEstimate;
    }

    // Handles the response from the backend
    getBundleTransactionGas = async (
        connectedTokenContract,
        transaction,
        options,
        functionName
    ) => {
        try {
            const _gasEstimate = await this.estimateGasOnChain(
                connectedTokenContract,
                transaction,
                options,
                functionName
            );

            return _gasEstimate;
        } catch (e) {
            // if we cannot get a value on-chain use default amount to simulate
            console.log('Ran into error while estimating gas', e);
            return 0;
        }
    }

    buildBundle = async (
        transactions,
        provider,
        blockNumber
    ) => {
        const block = await provider.getBlock("latest");

        const gasPrice = PRIORITY_GAS_PRICE.add(block.baseFeePerGas || 0);
        const gasLimit = 21000;

        // force that we have calculated gas if we are live
        const recoveryFunds = this.getBundleSimulationGas()

        // make sure that the sponsor account provides all the funds needed to transfer
        const ethTransferTransaction = {
            signer: this.sponsorWallet,
            transaction: {
                to: this.compromisedWallet?.address,
                gasPrice,
                value: recoveryFunds,
                gasLimit
            }
        }

        const eip1559Transactions = await Promise.all(
            transactions.map(async (transaction) => {
                // connect to the contract of the token we are saving
                const tokenContract = this.connectedContract(
                    transaction, provider
                );

                const connectedTokenContract = tokenContract.connect(
                    this.compromisedWallet
                );

                // prepare the generalized transaction
                const options = {};

                // retrieve the estimated gas needed for transferring
                const gasEstimate = await this.getBundleTransactionGas(
                    connectedTokenContract,
                    transaction,
                    options,
                    transaction.functionName
                )

                // prepare the data for the simulation
                const populateTx = await this.populateTransaction(
                    connectedTokenContract,
                    transaction,
                    options,
                    transaction.functionName
                );

                // Building the transaction
                return {
                    signer: this.compromisedWallet,
                    transaction: this.buildTransaction(
                        block,
                        transaction,
                        populateTx,
                        gasEstimate
                    )
                }
            })
        );

        // Get the beginning balance out of the compromomised wallet.
        const ethCleanTransaction = {
            signer: this.compromisedWallet,
            transaction: {
                to: transactions[0].recipient,
                gasPrice,
                value: Math.floor(this.compromisedWalletBalance.formatted * GWEI),
                gasLimit
            }
        }

        // Assemble the bundle
        return [
            ethTransferTransaction,
            ...eip1559Transactions,
            ethCleanTransaction
        ]
    };

    simulateBundle = async (flashbotsProvider, signedTransactions) => {
        const simulationResponse = await flashbotsProvider.simulate(
            signedTransactions,
            "latest"
        );

        // make sure that none of the transactions had errors
        if ("results" in simulationResponse) {
            for (let i = 0; i < simulationResponse.results.length; i++) {
                const txSimulation = simulationResponse.results[i];
                if ("error" in txSimulation) {
                    return {
                        success: false,
                        message: `TX #${i}: [${txSimulation.error.message}] ${txSimulation.revert}`
                    }
                }
            }

            // calculate the sum of gas used
            const gasUsed = simulationResponse.results.reduce(
                (acc, txSimulation) => acc + txSimulation.gasUsed,
                0
            );

            return {
                success: true,
                status: "pending",
                message: "Simulation success.",
                gasUsed
            };
        }

        return {
            success: false,
            status: "error",
            message: `Simulation Failed: ${simulationResponse.error.message}.`
        }
    }

    call = async () => {
        const provider = await ethers.getDefaultProvider("mainnet");

        const targetBlockNumber = this.determineTargetBlock(this.blockNumber);

        const authSigner = new ethers.Wallet(
            process.env.FLASHBOTS_AUTH_SIGNER,
            provider
        );

        const flashbotsProvider = await FlashbotsBundleProvider.create(
            provider,
            authSigner
        );

        const transactionBundle = await this.buildBundle(
            this.transactions,
            provider,
            targetBlockNumber
        );

        console.log('Transaction bundle: ', transactionBundle)

        const signedTransactions = await flashbotsProvider.signBundle(
            transactionBundle
        );
        const simulatedGasPrice = await this.simulateBundle(
            flashbotsProvider,
            signedTransactions
        );

        if (this.live == false)
            return {
                blockNumber: targetBlockNumber,
                status: "pending",
                transactionBundle,
                simulatedGasPrice
            }

        const bundleResponse = await flashbotsProvider.sendBundle(bundleTransactions, targetBlockNumber);

        if ('error' in bundleResponse) {
            return {
                blockNumber: targetBlockNumber,
                status: "error",
                transactionBundle,
                simulatedGasPrice: { success: false, gasUsed: 0, message: bundleResponse.error.message }
            }
        }

        const bundleResolution = await bundleResponse.wait()

        // If the transactions were processed
        if (bundleResolution === FlashbotsBundleResolution.BundleIncluded) {
            simulatedGasPrice.message = "Congrats! Bundle was included."

            return {
                blockNumber: targetBlockNumber,
                status: "success",
                transactionBundle,
                simulatedGasPrice,
                terminate: true,
                bundleResponse
            }

            // if the block passed without the bundle being included
        } else if (bundleResolution === FlashbotsBundleResolution.BlockPassedWithoutInclusion) {
            return {
                blockNumber: targetBlockNumber,
                transactionBundle,
                status: "pending",
                simulatedGasPrice: {
                    success: false,
                    gasUsed: 0,
                    message: 'Bundle not included. Will try again.'
                }
            }

            // if the account has had a transaction since we built this bundle
        } else if (bundleResolution === FlashbotsBundleResolution.AccountNonceTooHigh) {
            return {
                blockNumber: targetBlockNumber,
                transactionBundle,
                status: "error",
                simulatedGasPrice: {
                    success: false,
                    gasUsed: 0,
                    message: 'Nonce too high.'
                }
            }
        }

        return {
            blockNumber: targetBlockNumber,
            transactionBundle,
            status: "error",
            simulatedGasPrice: {
                success: false,
                gasUsed: 0,
                message: 'Ran into a serious issue System was not prepared for this.'
            }
        }
    }
}

module.exports = {
    RecoveryProcessor: RecoveryProcessor
}