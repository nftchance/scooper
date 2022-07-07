import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import TwitterIcon from '@mui/icons-material/Twitter';

import "./RecoverySuccessModal.css";
import { IconButton } from '@mui/material';

const ethers = require('ethers');

const GWEI = ethers.BigNumber.from(10).pow(9);

const RecoverySuccessModal = (props) => {
    const { open, transactions, transactionBundle } = props;

    const [modalOpen, setModalOpen] = useState(open);

    const formattedWalletAddress = (wallet) => {
        if (wallet?.address)
            return wallet.address.slice(0, 7) + "..." + wallet.address.slice(-4)
        if (wallet && typeof (wallet) === 'string')
            return wallet.slice(0, 7) + "..." + wallet.slice(-4)

        return "Pending..."
    }

    const ETHSaved = () => {
        const transaction = transactionBundle[transactionBundle.length - 1];
        if (transaction === undefined)
            return null;

        if (transaction?.transaction?.value)
            return transaction.transaction.value / GWEI
        return null;
    }

    useEffect(() => {
        setModalOpen(open);
    }, [open])

    return (
        <Modal
            open={modalOpen}
            onClose={() => { setModalOpen(false); }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >

            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                    <strong>RECOVERY SUCCESSFUL!</strong>
                </Typography>

                <Typography>
                    <strong>Recipient:</strong>
                    <span style={{ float: "right" }}><a href={`https://etherscan.io/address/${transactions[0]?.recipient}`}>
                        {formattedWalletAddress(transactions[0]?.recipient)}
                    </a></span>
                </Typography>

                {ETHSaved() && <Typography>
                    <strong>
                        ETH SAVED:
                        <span style={{ float: "right" }}>
                            {ETHSaved()} ETH
                        </span>
                    </strong>
                </Typography>}

                {/* NFT Transaction Breakdown */}
                <Typography sx={{ mt: 2, mb: 1 }}>
                    <strong>NFTs SAVED:</strong>
                </Typography>

                <Typography>
                    {transactions.map((transaction, idx) => {
                        return <span key={`transaction:${idx}`} className="transaction">
                            <img
                                alt={`transaction ${idx} image`}
                                src={transaction.image}
                                style={{
                                    border: "none",
                                    borderRadius: "50%",
                                    height: 25,
                                    width: 25
                                }}
                            />

                            <a target="_blank" rel="noreferrer" href={`https://etherscan.io/address/${transaction.token_address}`}>
                                {formattedWalletAddress(transaction.token_address)}
                            </a>

                            <span style={{ textAlign: "right" }}>
                                <a style={{ float: "right" }} target="_blank" rel="noreferrer" href={`http://opensea.io/assets/${transaction.token_address}/${transaction.token_id}`}>#{transaction.token_id}</a>

                                {transactionBundle[1 + idx]?.transaction?.hash
                                    && <IconButton href={`http://etherscan.io/tx/${transactionBundle[1 + idx].transaction.hash}`} target="_blank" rel="noreferrer" style={{ marginLeft: 10 }}>
                                        <ArtTrackIcon />
                                    </IconButton>
                                }
                            </span>
                        </span>
                    })}
                </Typography>

                <div className="buttons">
                    <Button
                        className="button"
                        target="_blank"
                        href={`http://twitter.com/intent/tweet?text=%F0%9F%9A%A8%F0%9F%9A%A8%20BREAKING%20NEWS%20%F0%9F%9A%A8%F0%9F%9A%A8%0A%0AI%20JUST%20RECOVERED%20${ETHSaved()?.toFixed(2)}%20ETH%20AND%20${transactions.length}%20NFT${transactions.length > 1 ? "S" : ""}%20FROM%20MY%20HACKED%20WALLET%20WITH%20%E2%97%B6%20SCOOPER.%0A%0Ahttps%3A%2F%2Fscooper.utc24.io%2F`}
                    >
                        <TwitterIcon />
                        Share
                    </Button>
                    <Button className="secondary">Save More</Button>
                </div>
            </Box>
        </Modal>
    )
}

export default RecoverySuccessModal;