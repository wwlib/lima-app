import React from 'react';

import logoImage from './logo-banner-600x150.png';
import './Logo.css';

const logo = (props: any) => (
    <div className="Logo" onClick={props.clicked}>
        {/* <div className="Title">
            LIMA App
        </div> */}
        <img src={logoImage} alt="App Logo" />
    </div>
);

export default logo;
