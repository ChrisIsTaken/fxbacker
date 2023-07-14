import React, { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import Register from './Register';

function App() {
    const [token, setToken] = useState('');

    useEffect(() => {
        const checkTokenExpiration = setInterval(() => {
            if (!token) {
                return;
            }

            const tokenExpiration = jwt.decode(token).exp;
            const currentTime = Date.now().valueOf() / 1000;

            if (currentTime > tokenExpiration) {
                setToken('');
            }
        }, 1000);

        return () => clearInterval(checkTokenExpiration);
    }, [token]);

    // ... rest of the code
}

export default App;
