import 'dotenv/config'

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Helmet } from "react-helmet";

import loadable from "@loadable/component";

// Handling web3 wallet things
import { MoralisProvider } from "react-moralis";
import { createClient, WagmiConfig } from "wagmi";
import { providers } from 'ethers';

import './App.css';

// Pages
import Loading from "./components/Block/Loading";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import TermsOfService from "./components/Legal/TermsOfService";
import PageNotFound from "./components/Pages/PageNotFound";

// Create a client that has a connected provider, but no connected wallet
const alchemyId = process.env.REACT_APP_ALCHEMY_ID
const wagmiClient = createClient({
	provider(config) { 
		return new providers.AlchemyProvider(config.chainId, alchemyId)
	}
});

const LoadableIndex = loadable(() => import("./components/Pages/Index"), {
  fallback: <Loading text="" />
});
const LoadableContact = loadable(() => import("./components/Contact/Contact"), { 
  fallback: <Loading text="Loading..." />
})
const LoadableFAQ = loadable(() => import("./components/FAQ/FAQ"), { 
  fallback: <Loading text="Loading..." />
})
const LoadableDashboard = loadable(() => import("./components/Dashboard/Dashboard"), {
  fallback: <Loading text="Loading..." />
});

function App() {
  return (
    <MoralisProvider 
      appId="97kvnuHnuAtwsPz1ne2ONP170i5mXpAXzGF1qhAv" 
      serverUrl="https://2dn1ra9obzy2.usemoralis.com:2053/server"
    >
      <WagmiConfig client={wagmiClient}>
        <Router>

          <Helmet>
            <title>SCOOPER</title>
            <meta property="og:title" content="SCOOPER" />
            <meta name="twitter:title" content="SCOOPER" />

            <meta name="description" content="Have you been hacked? Don't get stuck watching your tokens disappear! Simply connect your compromised wallet, connect a sponsor burner wallet to pay for gas and choose where the tokens you're saving should go." />
            <meta property="og:description" content="Have you been hacked? Don't get stuck watching your tokens disappear! Simply connect your compromised wallet, connect a sponsor burner wallet to pay for gas and choose where the tokens you're saving should go." />
            <meta name="twitter:description" content="Have you been hacked? Don't get stuck watching your tokens disappear! Simply connect your compromised wallet, connect a sponsor burner wallet to pay for gas and choose where the tokens you're saving should go." />
          </Helmet>
          
          <Navbar />
          <Routes>
            <Route exact path="/" element={<LoadableIndex />} />
            <Route exact path="/contact" element={<LoadableContact />} />
            <Route exact path="/faq" element={<LoadableFAQ />} />
            <Route exact path="/dashboard" element={<LoadableDashboard />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<PageNotFound />} />
            {/* catch all request if page isnt' found */}
          </Routes>
          <Footer />
        </Router>
      </WagmiConfig>
    </MoralisProvider>
  );
}

export default App;