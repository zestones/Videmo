import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Styles
import styles from './Notification.module.scss';


function Notification({ type, message, onClose }) {

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);


    let icon = null;
    let title = '';
    switch (type) {
        case 'error':
            icon = <ErrorIcon fontSize="large" />;
            title = 'An error occurred!';
            break;
        case 'warning':
            icon = <WarningIcon fontSize="large" />;
            title = 'Dangerous action!';
            break;
        case 'success':
            icon = <CheckCircleIcon fontSize="large" />;
            title = 'Success! Everything is fine.';
            break;
        default:
            break;
    }

    return (
        <Alert severity={type} icon={icon} className={styles.alert}>
            <AlertTitle className={styles.title}>{title}</AlertTitle>
            <span className={styles.message}>{message}</span>
            <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => onClose(null)}
                className={styles.closeButton}
            >
                <CloseIcon className={styles.closeIcon} fontSize="inherit" color="inherit" />
            </IconButton>
        </Alert>
    );
};

Notification.propTypes = {
    type: PropTypes.oneOf(['error', 'warning', 'success']).isRequired,
    message: PropTypes.string.isRequired,
};

export default Notification;
