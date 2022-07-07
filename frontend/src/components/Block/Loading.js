import React from 'react';

import './Loading.css';

const Loading = (props) => {
    const { text } = props;

    return (
        <div className="container loading-container">
            <h1>{text}</h1>
        </div>
    )
}

export default Loading;