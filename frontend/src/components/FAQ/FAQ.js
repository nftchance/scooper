import React from 'react';

import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import "./FAQ.css";

const FAQ = () => {
    const faqs = [
        {
            question: "Who is Scooper for?",
            answer: <Typography>Scooper is for any Ethereum user that has a compromised wallet with tokens inside it that need to be recovered. There are no gates, no fees, and no hurdles in place that prevents anyone from recovering tokens from a wallet that they have the private key to.</Typography>
        }, {
            question: "I need to give my private keys?",
            answer: <Typography>Yes, you do. By providing the private keys of both the Compromised Wallet and a Sponsor Wallet, we can remove the need for you to sign hundreds of transactions and allows Scooper to save your tokens in 1/100th the time it would take and completely eliminate any risk to funds used to extract the Compromised Wallet's assets. <br></br><br></br><u>While your private keys are not stored anywhere by Scooper, we HIGHLY recommend halting the usage of both the Compromised AND the Sponsor Wallet after using the Scooper Recovery in the name of security best practices.</u></Typography>
        }, {
            question: "How is the data I provide used?",
            answer: <Typography>No piece of data provided is stored in a database. With hot-data, as soon as the use has completed, it is discarded and lost forever. There are no analytics, no cookies; nothing that will track or allow any Scooper team member to access your data.</Typography>
        }, {
            question: "What is a 'Sponsor Account'?",
            answer: <Typography>The design of Scooper allows you to keep your ETH safe by actively calculating and transferring the amount of ETH needed for the gas cost of transferring your tokens. This means that you do not have to put additional money at risk to get NFTs out of a compromised wallet.</Typography>
        }, {
            question: "How much ETH does my sponsor need?",
            answer: <Typography>Your Sponsor wallet needs enough ETH to cover the gas usage of all token transfers. The active ETH balance of your compromised wallet is not used in order to save the highest amount of ETH with the lowest failure rate.</Typography>
        }, {
            question: "Are there any fees?",
            answer: <Typography>Scooper is a fee-free platform. There is no usage cost nor secret fees that are included in any transaction. On top of this, there is no front-end maintenance fee of any kind. Any entirely free-to-use service.</Typography>
        }, {
            question: "Does this work with tokens that are not NFTs?",
            answer: <Typography>At this time, Scooper is designed to solely save the Ethereum and NFTs in your account. Support for ERC20s is not currently implemented.</Typography>
        }, {
            question: "Can I get a token out of the scammers wallet?",
            answer: <Typography>No you cannot. Scooper can only save the tokens that are still in your wallet.</Typography>
        }, {
            question: "How is my usage tracked?",
            answer: <Typography>In short, it isn't. The only method of tracking in place is through blockchain data filtering by the `data` field provided when running the transactions. When running a transaction, we append 'SCOOPER' to the transfer data so that we can determine the genuine usage of the product without breaking anyones trust or privacy.</Typography>
        }, {
            question: "Is there a limit to my usage?",
            answer: <Typography>No. There are zero platform-sided limits meaning the only limits that you will ever face are blockchain-related limits. This includes max gas, max transactions in a bundle, etc...</Typography>
        }, {
            question: "Couldn't scammers use this?",
            answer: <Typography>Yes they could which is the perfect reason to always follow best practices. Once your account is compromised the only thing you can do is attempt to minimize damages as quickly as possible.</Typography>
        }, {
            question: "What can I do if I am having a problem?",
            answer: <Typography>Get in touch by utilizing the <Link to="/contact">Contact</Link> page and a Scooper team member will be in touch.</Typography>
        }, {
            question: "What can I do if I have an idea?",
            answer: <Typography>Get in touch by utilizing the <Link to="/contact">Contact</Link> page and a Scooper team member will be in touch. Or, if you're a developer you can hop right into the code and build the functionality you want to see!</Typography>
        }, {
            question: "Does this do the same thing as 'x'?",
            answer: <Typography>Don't know, don't care. It lets you save the tokens in your compromised wallet. Things can be improved over time. If you're passionate about this, I would love to see your code added to the project!</Typography>
        }, {
            question: "Wouldn't Scooper be better 'x' way?",
            answer: <Typography>Maybe! Feel free to submit a Pull Request with the idea or even build and launch another tool! Would love to see how you solve this problem for the largest number of people.</Typography>
        }, {
            question: "Why isn't my bundle being included?",
            answer: <Typography>Generally, when a bundle is not included that means that the bundle could not be completed within the active Ethereum block. This happens because the gas supplied was too low or there are too many transactions in the bundle. It is to be expected that it may take a few blocks before finding one that can include your bundle.</Typography>
        }, {
            question: "Why is my bundle erroring out?",
            answer: <Typography>When processing your bundle it displays the error encountered. Thanks to the design of Scooper, the only thing to try is selecting less NFTs to save (if you have 10+ selected) as everything else is automatically calculated and taken care of for you.</Typography>
        }, {
            question: "Is there somewhere I can get help?",
            answer: <Typography>No, there is not. Scooper is incredibly simple to use please just take your time and read the instructions provided on each step.</Typography>
        }, {
            question: "What do I do if I need a custom solution?",
            answer: <Typography>Custom-built solutions for single-use cases are available at the cost of a flat-rate 10 ETH owed upon successful recovery of assets. With this, you will not receive the code nor a project to run yourself. Reach out by utilizing the <Link to="/contact">Contact</Link> page and a Scooper team member will be in touch.</Typography>
        }, {
            question: "Can I run Scooper on my local computer so that I know everything is safe?",
            answer: <Typography>Yes! Scooper is open-source. You can find all the <a href="https://github.com/nftchance/scooper" target="_blank" rel="noreferrer">code on GitHub</a>.</Typography>
        }, {
            question: "How does Scooper work?",
            answer: <>
                <Typography>Simply put, Scooper democratizes the use of Flashbots and abstracts away all the complexities to enable to most efficient recovery of tokens in a compromised Ethereum wallet. By using Flashbots, the recovery effort cannot be front-run or hijacked by the scammer who has the Compromised Wallet private key.</Typography>

                <Typography>Behind the scenes, Scooper operates by:</Typography>

                <ol>
                    <li><Typography>Transfer the needed amount of ETH from the Sponsor Wallet to cover cost of transfer gas.</Typography></li>
                    <li><Typography>Transfer NFTs in Compromised Wallet to Recipient.</Typography></li>
                    <li><Typography>Transfer ETH in Compromised Wallet to Recipient.</Typography></li>
                </ol>
            </>
        },
    ]

    const [expanded, setExpanded] = React.useState('panel-0');

    const handlePanelChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    return (
        <>
            <Helmet>
                <title>FAQS | SCOOPER</title>
                <meta property="og:title" content="FAQS | SCOOPER" />
                <meta name="twitter:title" content="FAQS | SCOOPER" />

                <meta name="description" content="Have a question about SCOOPER? Browse the frequently asked questions and all the answers you may need!" />
                <meta property="og:description" content="Have a question about SCOOPER? Browse the frequently asked questions and all the answers you may need!" />
                <meta name="twitter:description" content="Have a question about SCOOPER? Browse the frequently asked questions and all the answers you may need!" />
            </Helmet>

            <div className="container">
                <div className="header">
                    <h1>FAQs</h1>
                    <p>Follow the steps below and save the tokens that are sitting in your compromised wallet without any usage fees outside of Ethereum network gas.</p>
                </div>

                {faqs.map((faq, idx) => (
                    <Accordion
                        expanded={expanded === `panel-${idx}`}
                        key={idx}
                        square={true}
                        onChange={handlePanelChange(`panel-${idx}`)}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${idx}-content`}
                            id={`panel-${idx}`}
                        >
                            <Typography>
                                <strong>{faq.question}</strong>
                            </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                            {faq.answer}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
        </>
    )
}

export default FAQ;