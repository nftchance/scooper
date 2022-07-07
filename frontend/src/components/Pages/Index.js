import "./Index.css";

import baycImage from "../../images/bayc.png";
import ccImage from "../../images/cc.png";
import moonbirdImage from "../../images/moonbirds.png";
import punkImage from "../../images/punk.png";
import nnImage from "../../images/nn.png";
import miladyImage from "../../images/milady.png";
import { Link } from "react-router-dom";

const Index = () => {
    const cards = [
        {
            image: baycImage,
            name: 'Bored Ape Yacht Club',
            tokenId: 8139,
            link: 'https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/8139'
        }, {
            image: ccImage,
            name: 'Cool Cats',
            tokenId: 5449,
            link: 'https://opensea.io/assets/ethereum/0x1a92f7381b9f03921564a437210bb9396471050c/1712'
        }, {
            image: moonbirdImage,
            name: 'Moonbirds',
            tokenId: 2128,
            link: 'https://opensea.io/assets/ethereum/0x23581767a106ae21c074b2276d25e5c3e136a68b/2128'
        }, {
            image: punkImage,
            name: 'CryptoPunk',
            tokenId: 1676,
            link: 'https://opensea.io/assets/ethereum/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb/1676'
        }, {
            image: nnImage,
            name: 'Nuclear Nerds',
            tokenId: 3827,
            link: 'https://opensea.io/assets/ethereum/0x0f78c6eee3c89ff37fd9ef96bd685830993636f2/3827'
        }, {
            image: miladyImage,
            name: 'Milady Maker',
            tokenId: 4631,
            link: 'https://opensea.io/assets/ethereum/0x5af0d9827e0c53e4799bb226655a1de152a425a5/4631'
        }
    ]

    return (
        <div className="container">
            <div className="hero">
                <div className="content">
                    <div className="hero-header">
                        <h1>SAVE YOUR NFTS AND ETH FROM A HACKED WALLET IN SECONDS.</h1>
                        <p>Have you been hacked? Don't get stuck watching your tokens disappear! Simply connect your compromised wallet, connect a sponsor burner wallet to pay for gas and choose where the tokens you're saving should go.</p>
                        
                        <Link to="/dashboard" className="button secondary">
                            RECOVER NOW
                        </Link>
                    </div>
                </div>
                <div className="images">
                    <div className="image-container">
                        {cards.map((card, idx) => {
                            return (
                                <div key={idx} className="card">
                                    <a href={card.link} target="_blank" rel="noreferrer">
                                        <p className="status">SAVED</p>
                                        <img 
                                            loading="lazy"
                                            src={card.image} 
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            alt=" "
                                        />
                                        <div className="line"></div>
                                        <p>{ card.name } {card?.tokenId && <span>#{ card.tokenId }</span>}</p>
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="step-container">
                <div className="step-header">
                    <h2>HOW TO SAVE YOUR TOKENS</h2>
                    <p>When your Ethereum wallet is compromised, you need to act fast to rescue your tokens before the hacker can drain or sell them. Scooper is a SAFE and FREE tool designed to help victims do just that. Move all of your tokens (currency and NFTs) from your compromised wallet without risking funds to a new, safe wallet in seconds.</p>
                </div>

                <div className="steps">
                    <div className="card">
                        <div className="card-body">
                            <p className="status">1. WALLETS</p>
                            <p>To use Scooper, you need to provide three pieces of information: the seed phrase of your compromised wallet, the seed phrase of a sponsor wallet that will be used to pay gas fees to transfer your tokens and the destination address of a new, safe wallet for your tokens. </p> 
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <p className="status">2. TOKENS</p>
                            <p>With your wallets connected and the recipient set, you are ready to transfer the ETH and NFTs in your compromised wallet. Automatically retrieved, all you have to do is select all the tokens that you would like to save and the system will get everything ready to recover.</p> 
                        </div> 
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <p className="status">3. RECOVERY</p>
                            <p>Once everything is setup and ready to go, all you have to do is click the Recover Tokens button and Scooper will attempt to run the transaction bundle every new network block until it succeeds or fails.</p>
                            <p>
                                <Link to="/dashboard/"><strong>Recover Now</strong></Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Index;