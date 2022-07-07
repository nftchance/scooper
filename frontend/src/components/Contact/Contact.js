import React, { useState } from 'react';

import { Helmet } from "react-helmet";

import { Alert, Button, TextField } from '@mui/material';

import { ethers } from "ethers";

const Contact = () => {
    const defaultValues = {
        name: "",
        response_method: "",
        subject: "",
        budget: "",
        message: "",
        compromisedWallet: "",
        secretWord: "",
        verification: "",
    }

    const [formValues, setFormValues] = useState(defaultValues);
    const [response, setResponse] = useState(null);

    // Psuedo-captcha system. Only way we are getting spam is if someone makes a bot specifically for this.
    const defaultVerification = () => {
        return [
            Math.floor(Math.random() * 50),
            Math.floor(Math.random() * 20)
        ]
    }
    const [random, setRandom] = useState(defaultVerification)

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: value
        })
    }

    const compromisedErrors = () => {
        if (formValues.compromisedWallet === "") return null;

        try {
            ethers.utils.getAddress(formValues.compromisedWallet)
        } catch (e) {
            return "Invalid address provided for compromised wallet."
        }

        return null;
    }

    const verificationErrors = () => {
        if (formValues.verification === "") return null;

        if (parseInt(formValues.verification) === random[0] + random[1])
            return null

        return 'Invalid verification message provided.';
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (verificationErrors() !== null)
            return

        fetch('https://scooper-api.utc24.io/contact/', {
            method: "POST",
            body: JSON.stringify(formValues),
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => res.json())
            .then(res => {
                setResponse({
                    severity: 'success',
                    message: 'Successfully sent contact message. A Scooper team member will be in touch shortly.'
                })
                setFormValues(defaultValues);
                setRandom([
                    Math.floor(Math.random() * 50),
                    Math.floor(Math.random() * 20)
                ]);
            })
            .catch(e => {
                setResponse({
                    severity: 'error',
                    message: 'Ran into an error while sending the contact message. Try again later.'
                })
                setFormValues(defaultValues);
                setRandom([
                    Math.floor(Math.random() * 50),
                    Math.floor(Math.random() * 20)
                ]);
            })
    }

    return (
        <>
            <Helmet>
                <title>CONTACT | SCOOPER</title>
                <meta property="og:title" content="CONTACT | SCOOPER" />
                <meta name="twitter:title" content="CONTACT | SCOOPER" />

                <meta name="description" content="Need a custom solution to save your Ethereum and tokens from your compromised wallet? Get in touch with the SCOOPER team and save your tokens now!" />
                <meta property="og:description" content="Need a custom solution to save your Ethereum and tokens from your compromised wallet? Get in touch with the SCOOPER team and save your tokens now!" />
                <meta name="twitter:description" content="Need a custom solution to save your Ethereum and tokens from your compromised wallet? Get in touch with the SCOOPER team and save your tokens now!" />
            </Helmet>

            <div className="container">
                <div className="header">
                    <h1>Contact</h1>
                    <p>Need a custom solution to recover the tokens from your wallet? Get in touch with the Scooper team by filling out the form below.</p>
                </div>

                {response !== null && <Alert severity={response.severity} square={true} style={{ marginBottom: 20 }}>
                    {response.message}
                </Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        id="name"
                        type="text"
                        name="name"
                        label="Name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        style={{ width: "100%", marginBlock: 15 }}
                        required
                    />

                    <TextField
                        id="response_method"
                        type="text"
                        name="response_method"
                        label="Contact Method"
                        value={formValues.response_method}
                        onChange={handleInputChange}
                        style={{ width: "100%", marginBlock: 15 }}
                        required
                    />

                    <TextField
                        id="subject"
                        type="text"
                        name="subject"
                        label="Subject"
                        value={formValues.subject}
                        onChange={handleInputChange}
                        style={{ width: "100%", marginBlock: 15 }}
                        required
                    />

                    <TextField
                        id="budget"
                        type="text"
                        name="budget"
                        label="Payment Budget (ETH)"
                        value={formValues.budget}
                        onChange={handleInputChange}
                        style={{ width: "100%", marginBlock: 15 }}
                        required
                    />

                    <TextField
                        id="message"
                        type="text"
                        name="message"
                        label="Message"
                        value={formValues.message}
                        onChange={handleInputChange}
                        style={{ width: "100%", marginBlock: 15 }}
                        multiline
                        maxRows={Infinity}
                        required
                    />

                    <TextField
                        id="compromisedWallet"
                        type="text"
                        name="compromisedWallet"
                        label="Compromised Wallet Address"
                        value={formValues.compromisedWallet}
                        onChange={handleInputChange}
                        style={{ width: "100%", marginBlock: 15 }}
                        required
                        error={compromisedErrors() != null}
                        helperText={compromisedErrors()}
                    />

                    <TextField
                        id="secretWord"
                        type="text"
                        name="secretWord"
                        label="Secret Word"
                        value={formValues.secretWord}
                        onChange={handleInputChange}
                        style={{ width: "100%", marginBlock: 15 }}
                        helperText={"Use this to know you're really talking to the Scooper team."}
                        required
                    />

                    <TextField
                        id="verification"
                        type="number"
                        name="verification"
                        label={`What is ${random[0]} + ${random[1]}?`}
                        value={formValues.verification}
                        onChange={handleInputChange}
                        style={{ width: "100%", marginBlock: 15 }}
                        error={verificationErrors() != null}
                        helperText={verificationErrors()}
                        required
                    />

                    <Button
                        variant="contained"
                        style={{
                            width: "100%",
                            marginBlock: 10
                        }}
                        type="submit"
                    >
                        Send Message
                    </Button>
                </form>
            </div>
        </>
    )
}

export default Contact;