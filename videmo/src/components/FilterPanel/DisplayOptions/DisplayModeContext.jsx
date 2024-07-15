import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";

import DisplaySettingsApi from "../../../services/api/settings/DisplaySettingsApi";

const DisplayModeContext = createContext();

export const useDisplayMode = () => {
    return useContext(DisplayModeContext);
};

export const DisplayModeProvider = ({ children }) => {
    // Api initialization
    const displaySettingsApi = useMemo(() => new DisplaySettingsApi(), []);

    // State initialization
    const [displayMode, setDisplayMode] = useState(null);

    useEffect(() => {
        displaySettingsApi.readDisplayMode()
            .then((mode) => setDisplayMode(mode))
            .catch((error) => console.error(error));
    }, [displaySettingsApi, setDisplayMode]);


    const value = useMemo(() => {
        return { displayMode, setDisplayMode };
    }, [displayMode, setDisplayMode]);

    return (
        <DisplayModeContext.Provider value={value}>
            {children}
        </DisplayModeContext.Provider>
    );
};

DisplayModeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
