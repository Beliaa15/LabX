import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, AppBar, Toolbar, Typography } from '@mui/material';

const Layout = ({ children }) => {
    const { handleLogout } = useAuth();

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        My App
                    </Typography>
                    <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', marginRight: '15px' }}>Profile</Link>
                    <Link to="/complete_registration" style={{ color: '#fff', textDecoration: 'none', marginRight: '15px' }}>Complete Registration</Link>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <main>{children}</main>
        </div>
    );
};

export default Layout;
