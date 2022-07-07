import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

import RecoverySuccessModal from './RecoverySuccessModal';

import "./RecoveryProcessor.css";
import { Typography } from '@mui/material';

const RecoveryProcessor = forwardRef((props, ref)  => {
    const { 
        compromisedWalletPrivateKey,
        compromisedWallet,
        compromisedWalletBalance,
        sponsorWalletPrivateKey,
        sponsorWallet,
        sponsorWalletBalance,
        transactions
    } = props;

    const [bundleGasEstimate, setBundleGasEstimate] = useState(0);
    const [logs, setLogs] = useState([{
        blockNumber: 0,
        status: "pending", 
        simulatedGasPrice: { 
            success: true, 
            message: "Loading...", 
            gasUsed: 0 
        }
    }])

    const [transactionBundle, setTransactionBundle] = useState([])
    const [success, setSuccess] = useState(false);

    const handleLog = (log, res) => { 
        if(log === true) {
            setLogs([
                res, 
                ...logs.filter(logObj => logObj.blockNumber !== res.blockNumber)
            ]);            
        }
    }

    const getStatus = () => {
        return 'pending';
    }

    const call = async (blockNumber, live, log) => {
        if(success) return {
            blockNumber: blockNumber,
            status: "pending", 
            simulatedGasPrice: { 
                success: true,
                gasUsed: 0, 
                message: 'Done processing this bundle.'
            }
        }

        const data = {
            blockNumber,
            live,
            compromisedWalletPrivateKey,
            compromisedWallet,
            compromisedWalletBalance,
            sponsorWalletPrivateKey,
            sponsorWallet,
            sponsorWalletBalance,
            transactions,
            bundleGasEstimate
        }

        console.log('Sending bundle for processing:', data)

        return fetch('https://scooper-api.utc24.io/transaction/', { 
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(res => {
            console.log('Bundle response:', res);
            setTransactionBundle(res.transactionBundle);
            // Set the amount of gas that is needed for this bundle
            setBundleGasEstimate(res.simulatedGasPrice.gasUsed);

            // Add the confirmation to the console
            handleLog(log, res);
            if(res.status === "success") {
                setSuccess(true);
            }

            return res;
        })
        .catch(e => {
            const res = {
                success: false,
                status: 'error',
                message: "Could not connect to server. Our system is down please try again later. This will not resolve itself."
            }
            
            // Add the error to the console
            handleLog(log, res);

            return res;
        })
    }

    // Enable the recovery handler to the call the function
    useImperativeHandle(ref, () => ({
        async call(blockNumber, live, log) {
            return await call(blockNumber, live, log);
        }
    }));

    // Clear the gas estimate any time the transactions change
    // and re-enable the ability for the clock to run the processing
    useEffect(() => { 
        setBundleGasEstimate(0);
        setSuccess(false);
    }, [transactions])

    return (
        <>
            <RecoverySuccessModal 
                open={success} 
                transactions={transactions} 
                transactionBundle={transactionBundle}
            />

            <div className="activity-header">
                <Typography><strong>Activity Log</strong></Typography>
                <div className='status-indicator-container'>
                    <div className={`status-indicator ${getStatus()}`}></div>
                    <Typography><strong>{getStatus().toUpperCase()}</strong></Typography>
                </div>
            </div>


            <div className="console" style={{
                background: "#000",
                height: 200,
                overflowY: "scroll",
                padding: 15
            }}>
                {logs.map((log) => ( 
                    <p 
                        key={`log:${log.blockNumber}`}
                        className={`log-message log-${log.status}`}
                    >
                        <a 
                            target="_blank" 
                            href={`https://etherscan.io/block/${log.blockNumber}`}
                            rel="noreferrer"
                        >
                            [▣ { log.blockNumber }]
                        </a> 
                        {log.simulatedGasPrice?.gasUsed !== 0 && 
                            <>
                                [{ log.simulatedGasPrice.gasUsed } gas] 
                            </>
                        }
                        { log.simulatedGasPrice.message }
                    </p>
                ))}
            </div>
        </>
    )
});

export default RecoveryProcessor;