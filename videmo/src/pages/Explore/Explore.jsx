import React, { useState } from "react";

// Pages
import Source from "./Source/Source";
import SourceContent from "./SourceContent/SourceContent";

// This page is splitted into 2 parts: 
// 1. Source Display
// 2. Source content Display

function Explore() {
    // State initialization
    const [selectedExtension, setSelectedExtension] = useState(null);

    const handleSelectedExtension = (extension) => setSelectedExtension(extension);

    return (
        <>
            {!selectedExtension ? (
                <Source handleSelectedExtension={handleSelectedExtension} />
            ) : (
                <SourceContent 
                    searchScope={selectedExtension} 
                    calledFromExplore={true}
                    onExtensionReset={setSelectedExtension} />
            )}
        </>
    );
}

export default Explore;
