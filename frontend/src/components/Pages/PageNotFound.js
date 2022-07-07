import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";

import "./PageNotFound.css";

const PageNotFound = () => {
    return (
        <>
            <Helmet>
                <title>PAGE NOT FOUND | SCOOPER</title>
                <meta property="og:title" content="PAGE NOT FOUND | SCOOPER" />
                <meta name="twitter:title" content="PAGE NOT FOUND | SCOOPER" />

                <meta name="description" content="The SCOOPER page you were looking for could not be found." />
                <meta property="og:description" content="The SCOOPER page you were looking for could not be found." />
                <meta name="twitter:description" content="The SCOOPER page you were looking for could not be found." />
            </Helmet>

            <div className="container error-container">
                <h1>Page Not Found</h1>
                <p>The page you were attempting to access appears to be have been lost.</p>

                <div>
                    <Link to="/" style={{
                        marginRight: 10
                    }}>
                        <button className="button">HOME</button>
                    </Link>
                    <Link to="/dashboard">
                        <button className="button secondary">TO DASHBOARD</button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default PageNotFound;