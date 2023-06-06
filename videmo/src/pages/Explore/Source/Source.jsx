import React, { useEffect, useState } from "react";

// Services
import ExtensionApi from "../../../services/api/extension/ExtensionApi";

// Styles
import styles from "./Source.module.scss";

function Source({ handleSelectedExtension }) {
    const [extensionApi] = useState(() => new ExtensionApi());
    const [extensions, setExtensions] = useState([]);

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => setExtensions(data))
            .catch((error) => console.error(error));
    }, [extensionApi]);

    return (
        <div className={styles.extensions}>
            <h3>Source local</h3>
            {extensions.map((extension) => (
                <div
                    key={extension.id}
                    className={styles.extension}
                    onClick={() => handleSelectedExtension(extension)}>
                    <div className={styles.extensionIcon} >
                        <img src="/icons/local-source.png" alt="Local source" />
                    </div>
                    <p className={styles.extensionName}>
                        {extension.name}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default Source;