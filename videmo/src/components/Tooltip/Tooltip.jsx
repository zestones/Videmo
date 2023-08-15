import React from 'react';
import PropTypes from 'prop-types';

// External
import { Tooltip as MUITooltip, Zoom } from '@mui/material';

function Tooltip({ title, children, placement = 'right' }) {
    return (
        <MUITooltip
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
