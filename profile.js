import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        const getProfile = async () => {
            const res = await axios.get('/profile');
            setFullName(res.data.fullName);
            setBio(res.data.bio);
        };

        getProfile();
    }, []);

    const updateProfile = async () => {
        await axios.put('/profile', { fullName, bio });
        alert('Profile updated successfully');
    };

    return (
        <div>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" />
            <button onClick={updateProfile}>Update Profile</button>
        </div>
    );
}

export default Profile;
