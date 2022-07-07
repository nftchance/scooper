import { useEffect, useState, useRef } from 'react';

import RecoveryProcessor from './RecoveryProcessor';

import Button from '@mui/material/Button';

const RecoveryHandler = (props) => {
    const {
        provider,
        compromisedWalletPrivateKey,
        compromisedWallet,
        compromisedWalletBalance,
        sponsorWalletPrivateKey,
        sponsorWallet, 
        sponsorWalletBalance,
        recipient,
        nftsRecovering
    } = props;

    const recoveryProcessorRef = useRef();

    const [live, setLive] = useState(false);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => { 
        // Make sure that we clear the processing when nfts to save is updated.
        setLive(false);

        // Prepare all the data needed for a safeTransferFrom() call
        setTransactions(
            nftsRecovering.map(nft => {
                nft.recipient = recipient;
                nft.data = '0x';

                return nft
            })
        )
    }, [
        recipient, 
        nftsRecovering
    ])

    // update the running clock anytime a new wallet is attached
    useEffect(() => {
        var running = false;

        // If we have selected nfts and the needed wallets, run the clock
        if(
            compromisedWallet?.address &&
            sponsorWallet?.address &&
            nftsRecovering.length > 0 && 
            recipient &&
            recoveryProcessorRef
        ) { 
            provider.once('block', async (blockNumber) => { 
                if(running === false) {
                    running = true;

                    try {
                        const response = await recoveryProcessorRef.current.call(
                            blockNumber,
                            live,
                            true 
                        );

                        if(response?.terminate === true) {
                            setLive(false);
                            provider.off('block');
                        }

                    } catch (e) {
                        console.error("Encountered error when building bundle:", e);
                    }

                    running = false;
                }
            });
        }

        return () => { provider.off('block'); }
    }, [
        provider, 
        compromisedWallet, 
        sponsorWallet,
        nftsRecovering,
        recipient,
        live
    ])

    return (
        <>
            <RecoveryProcessor 
                compromisedWalletPrivateKey={compromisedWalletPrivateKey}
                compromisedWallet={compromisedWallet}
                compromisedWalletBalance={compromisedWalletBalance}
                sponsorWalletPrivateKey={sponsorWalletPrivateKey}
                sponsorWallet={sponsorWallet}
                sponsorWalletBalance={sponsorWalletBalance}
                transactions={transactions} 
                ref={recoveryProcessorRef} 
            />

            <Button
                variant="contained"
                style={{
                    width: "100%",
                    marginBlock: 10
                }}
                onClick={() => { setLive(!live); }}
            >
                {live ? "Stop" : "Start"} Recovery
            </Button>
        </>
    )
}

export default RecoveryHandler;