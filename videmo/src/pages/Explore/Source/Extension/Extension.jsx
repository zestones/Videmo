import React from "react";
import PropTypes from 'prop-types';

// Components
import SourceCard from "../../../../components/Card/SourceCard/SourceCard";

import styles from "./Extension.module.scss";


function Extension({ extensions, handleSelectedExtension }) {
    console.log("extensions");
    console.log(extensions);
    return (
        <div className={styles.extensions}>
            {extensions?.local?.length === 0 ? (
                <div className={styles.extension}>
                    <p className={styles.extensionName}>
                        No local extensions found
                    </p>
                </div>
            ) : (
                extensions?.local?.map((extension) => (
                    <SourceCard
                        key={extension.id}
                        extension={extension}
                        status="local"
                        callback={handleSelectedExtension}
                    />
                ))
            )}

            <hr />

            {extensions.external && extensions.external.length === 0 ? (
                <div className={styles.extension}>
                    <p className={styles.extensionName}>
                        No remote extensions found
                    </p>
                </div>
            ) : (
                extensions.external?.map((extension) => (
                    <SourceCard
                        key={extension.id}
                        extension={extension}
                        status="remote"
                        callback={handleSelectedExtension}
                    />
                ))
            )}
        </div>

    );
}

Extension.propTypes = {
    extensions: PropTypes.object.isRequired,
    handleSelectedExtension: PropTypes.func.isRequired
};

export default Extension;
