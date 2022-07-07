import React, { useState, useEffect } from "react";

import { Helmet } from "react-helmet";

import { useMoralisWeb3Api } from "react-moralis";
import { useBalance } from "wagmi";
import { ethers } from "ethers";

import RecoveryHandler from "../Flashbot/RecoveryHandler"

import Alert from '@mui/material/Alert';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import TextField from '@mui/material/TextField';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const Dashboard = () => {
    const Web3Api = useMoralisWeb3Api()

    const columns = [
        {
            field: 'image',
            headerName: '',
            width: 50,
            sortable: false,
            renderCell: (params) => <div style={{
                backgroundColor: "#ccc",
                borderRadius: "50%",
                height: 25,
                width: 25
            }}><img 
                alt=" "
                src={params.value} 
                style={{
                    border: "none",
                    borderRadius: "50%",
                    height: 25,
                    width: 25
                }}
            /></div>,
        }, { 
            field: 'token_id', 
            headerName: 'ID', 
            flex: 1,
            minWidth: 100
        }, {
            field: 'name', 
            headerName: 'Name',
            flex: 1.5,
            minWidth: 150
        }, { 
            field: 'contract_type',
            headerName: 'Type',
            flex: 2,
            minWidth: 200
        }, {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
        }
    ];
     
    // Recovery settings
    // TODO: Update to store the private key as well as we need to be able to pass it to the server.
    const [compromisedWalletPrivateKey, setCompromisedWalletPrivateKey] = useState(null);
    const [compromisedWallet, setCompromisedWallet] = useState();
    const { data: compromisedWalletBalance } = useBalance({
        addressOrName: compromisedWallet?.address,
        watch: true,
    })

    const [sponsorWalletPrivateKey, setSponsorWalletPrivateKey] = useState(null);
    const [sponsorWallet, setSponsorWallet] = useState();
    const { data: sponsorWalletBalance } = useBalance({
        addressOrName: sponsorWallet?.address,
        watch: true,
    })
    
    const [recipient, setRecipient] = useState("");

    // Handling which nfts to recover
    const [nfts, setNFTs] = useState([]);
    const [nftsRecovering, setNFTsRecovering] = useState([]);

    const handlePrivateKeyChange = (event) => {
        var wallet = {};

        try {
            setCompromisedWalletPrivateKey(event.target.value);
            
            wallet = new ethers.Wallet(
                event.target.value, 
                ethers.getDefaultProvider()
            );

        } catch(e) {
            wallet = { failed: true }
        }

        setCompromisedWallet(wallet);
    }

    const compromisedErrors = () => { 
        if(compromisedWallet?.failed)
            return "Invalid private key for compromised wallet."

        return null;
    }

    const handleSponsorPrivateKeyChange = (event) => {
        var wallet = {};
        try {
            setSponsorWalletPrivateKey(event.target.value);

            wallet = new ethers.Wallet(
                event.target.value, 
                ethers.getDefaultProvider()
            );

        } catch(e) {
            wallet = { failed: true }
        }

        setSponsorWallet(wallet);
    }

    const sponsorErrors = () => {
        if(sponsorWallet?.failed)
            return "Invalid private key used for sponsor."

        if(compromisedWallet?.address === sponsorWallet?.address)
            return "The sponsor private key cannot match the compromised private key."

        return null;
    }

    const handleRecipientAddressChange = (event) => {
        var address = '';
        try {
            address = ethers.utils.getAddress(event.target.value);
        } catch (e) {
            address = 'Invalid Address'
        }

        setRecipient(address);
    }

    const recipientErrors = () => { 
        if(recipient === 'Invalid Address')
            return "This recipient address is invalid."

        if(compromisedWallet?.address === recipient)
            return "The recipient cannot be the same as the compromised wallet."

        if(sponsorWallet?.address === recipient)
            return "You just gave me the private key to the sponsor wallet. Please use better security practices and use a wallet that you have not shared the private key to."

        return null;
    }

    const formattedWalletAddress = (wallet) => {
        if(wallet?.address)
            return wallet.address.slice(0, 7) + "..." + wallet.address.slice(-4)
        if(wallet && typeof(wallet) === 'string')
            return wallet.slice(0, 7) + "..." + wallet.slice(-4)
        
        return "Pending..."
    }

    const formattedNFTImage = (nft) => { 
        const metadata = JSON.parse(nft.metadata)
        if(!metadata?.image && !metadata?.image_url) return null

        var image_key = 'image'
        if(!metadata?.image) image_key = 'image_url'
       
        return metadata[image_key].replace("ipfs://", "https://ipfs.moralis.io:2053/ipfs/") 
    }

    // Front-end control
    const [expanded, setExpanded] = React.useState('panel1');
    const [pageSize, setPageSize] = React.useState(20);

    const handlePanelChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    useEffect(() => {         
        var nftsCursor = null;

        const fetchNFTs = async (top, nftsHeld) => {    
            return Web3Api.account
            .getNFTs({
                chain: "mainnet",
                address: compromisedWallet?.address,
                cursor: nftsCursor
            })
            .then(_nfts => {
                // make sure we haven't reached the end of the cursor
                if(_nfts['result'].length !== 0) {
                    // append the newest list of results
                    nftsHeld = [
                        ...nftsHeld, 
                        ..._nfts['result']
                            .filter(nft => nft.name)
                            .filter(nft => {
                                return ['ERC1155', 'ERC721'].includes(nft.contract_type)
                            })
                            .map((nft, idx) => {
                                nft.id = `${nft.token_address}:${nft.token_id}:${idx}`;
                                nft.image = formattedNFTImage(nft); 
                                nft.functionName = "safeTransferFrom";
    
                                return nft;
                            }),
                    ];
    
                    // recursively call until we've reached the end of their nfts
                    if(_nfts?.cursor !== "") {
                        nftsCursor = _nfts.cursor;
                        nftsHeld = fetchNFTs(false, nftsHeld)
                    }
                }
    
                return nftsHeld;
            })
            .then(nftsHeld => { 
                if(top === true) {
                    setNFTs(nftsHeld);
                } else {
                    return nftsHeld;
                }
            })
        };

        if(compromisedWallet?.address) {
            fetchNFTs(true, []);
        }
    }, [
        Web3Api.account,
        compromisedWallet?.address,
        compromisedWalletBalance
    ])

    return (
        <>
            <Helmet>
                <title>DASHBOARD | SCOOPER</title>
                <meta property="og:title" content="DASHBOARD | SCOOPER" />
                <meta name="twitter:title" content="DASHBOARD | SCOOPER" />
                
                <meta name="description" content="Save the NFTs and Ethereum from your compromised wallet now! With just a few steps you can save the nfts you've lost to a hacker without any usage-fees to pay." />
                <meta property="og:description" content="Save the NFTs and Ethereum from your compromised wallet now! With just a few steps you can save the nfts you've lost to a hacker without any usage-fees to pay." />
                <meta name="twitter:description" content="Save the NFTs and Ethereum from your compromised wallet now! With just a few steps you can save the nfts you've lost to a hacker without any usage-fees to pay." />
            </Helmet>
            
            <div className="container dashboard">
                <div className="header">
                    <h1>Dashboard</h1>
                    <p>Follow the steps below and save the tokens that are sitting in your compromised wallet without any usage fees outside of Ethereum network gas.</p>
                </div>

                <Alert severity="warning" style={{ marginBottom: 20 }} square={true}>
                    Scooper does not use a database to store any piece of data for any amount of time. While your data is not stored, the private key data is passed to the server for processing. Because the Scooper process needs both the private key of the compromised and sponsor wallet to safely extract your tokens, we highly recommend <b>CEASING USAGE OF BOTH WALLETS</b> after the process is complete.
                </Alert>

                <Accordion 
                    expanded={expanded === 'panel1'} 
                    onChange={handlePanelChange('panel1')}
                    square={true}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography><strong>1. Compromised Private Key</strong></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography style={{
                            marginBottom: 10
                        }}>To use the backend transaction system please supply the private key (not the address) to the wallet that has been compromised. Copy and paste the private key of the compromised wallet here.</Typography>

                        <TextField 
                            id="privateKey" 
                            label="Compromised Private Key" 
                            onChange={handlePrivateKeyChange} 
                            style={{ width: "100%", marginBlock: 15 }}
                            type='password'
                            error={compromisedErrors() != null}
                            helperText={compromisedErrors()}
                        />

                        <Typography>
                            <strong>Compromised Address:</strong>
                        </Typography>
                        <Typography>
                            <a href={`https://etherscan.io/address/${compromisedWallet?.address}`} target="_blank" rel="noreferrer">
                                {formattedWalletAddress(compromisedWallet)}
                            </a>
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion 
                    disabled={ !compromisedWallet?.address || compromisedErrors() != null } 
                    expanded={expanded === 'panel2'} 
                    onChange={handlePanelChange('panel2')}
                    square={true}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                    >
                        <Typography><strong>2. Sponsor Private Key</strong></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography style={{
                            marginBottom: 10
                        }}>To run a bundled transaction we need an account to sponsor the transactions as your compromised account cannot pay gas. This allows us to send Ethereum and recover the lost assets in a single block. Copy and paste the private key of the sponsor wallet here.</Typography>

                        <TextField 
                            id="sponsorPrivateKey" 
                            label="Sponsor Private Key"
                            error={sponsorErrors() != null}
                            helperText={sponsorErrors()}
                            onChange={handleSponsorPrivateKeyChange} 
                            style={{ 
                                width: "100%", 
                                marginBlock: 15 
                            }}
                            type='password'
                            />

                        <Typography>
                            <strong>Sponsor Address:</strong>
                        </Typography>
                        <Typography>
                            <a href={`https://etherscan.io/address/${sponsorWallet?.address}`} target="_blank" rel="noreferrer">
                                {formattedWalletAddress(sponsorWallet)}
                            </a>
                        </Typography>
                    </AccordionDetails>
                </Accordion>  

                <Accordion 
                    disabled={ !sponsorWallet?.address || sponsorErrors() != null } 
                    expanded={expanded === 'panel3'} 
                    onChange={handlePanelChange('panel3')}
                    square={true}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3a-content"
                        id="panel3a-header"
                    >
                        <Typography><strong>3. Recipient Wallet</strong></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography style={{
                            marginBottom: 10
                        }}>Please enter the address (not the private key) where any recovered ETH and NFTs will go. This should be a new / uncompromised account that you have not shared the private key anywhere. (Do not use the 'Sponsor Wallet')</Typography>
                        
                        <TextField 
                            id="recipient" 
                            label="Recipient Address" 
                            error={recipientErrors() != null}
                            helperText={recipientErrors()}
                            onChange={handleRecipientAddressChange} 
                            style={{ width: "100%", marginBlock: 15 }}
                        />
                        
                        <Typography>
                            <strong>Recipient Address:</strong>
                        </Typography>
                        <Typography>
                            {recipient 
                                ? <a href={`https://etherscan.io/address/${recipient}`} target="_blank" rel="noreferrer">
                                    {formattedWalletAddress(recipient)}
                                </a> 
                                : "Loading..."
                            }
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion 
                    disabled={!compromisedWallet} 
                    expanded={expanded === 'panel4'} 
                    onChange={handlePanelChange('panel4')}
                    square={true}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel4a-content"
                        id="panel4a-header"
                    >
                        <Typography><strong>4. Choose NFTs</strong></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography style={{
                            marginBottom: 20
                        }}>Choose all of the tokens that you would like to save from the compromised wallet.</Typography>
                        <div style={{ 
                            height: 650, 
                            width: '100%' 
                        }}>
                            {nfts && <DataGrid
                                rows={nfts}
                                columns={columns}
                                components={{ Toolbar: GridToolbar }}
                                pageSize={pageSize}
                                rowsPerPageOptions={[10, 20, 100]}
                                onPageSizeChange={
                                    (_pageSize) => setPageSize(_pageSize)
                                }
                                checkboxSelection
                                onSelectionModelChange={(ids) => {
                                    const selectedIDs = new Set(ids);
                                    const selectedRowData = nfts.filter((nft) =>
                                        selectedIDs.has(nft.id)
                                    );
                                    
                                    setNFTsRecovering(selectedRowData);
                                }}
                            />}
                        </div>
                    </AccordionDetails>
                </Accordion>

                <Accordion 
                    disabled={ 
                        !compromisedWallet?.address ||
                        !sponsorWallet?.address ||
                        !recipient ||
                        nftsRecovering.length === 0 
                    } 
                    expanded={expanded === 'panel5'} 
                    onChange={handlePanelChange('panel5')}
                    square={true}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel5a-content"
                        id="panel5a-header"
                    >
                        <Typography><strong>5. Recover NFTs</strong></Typography>
                    </AccordionSummary>
                        
                    <AccordionDetails>
                        <RecoveryHandler 
                            provider={ethers.getDefaultProvider()}
                            compromisedWalletPrivateKey={compromisedWalletPrivateKey}
                            compromisedWallet={compromisedWallet}
                            compromisedWalletBalance={compromisedWalletBalance}
                            sponsorWalletPrivateKey={sponsorWalletPrivateKey}
                            sponsorWallet={sponsorWallet}
                            sponsorWalletBalance={sponsorWalletBalance}
                            recipient={recipient}
                            nftsRecovering={nftsRecovering}
                        />
                    </AccordionDetails> 
                </Accordion>
            </div>
        </>
    )
}

export default Dashboard;