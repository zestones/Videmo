import React from 'react';
import PropTypes from 'prop-types';

// External
import { Tooltip as MUITooltip, Zoom } from '@mui/material';

// Styles
import styles from './Tooltip.module.scss';

function Tooltip({ title, children, placement = 'right' }) {
    return (
        <MUITooltip
            classes={{ popper: styles['tooltip'] }}
            title={title}
            placement={placement}
            TransitionComponent={Zoom}
            arrow
        >
            {children}
        </MUITooltip>
    );
}

Tooltip.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default Tooltip;
