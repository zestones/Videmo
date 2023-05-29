import React, { useState, useEffect } from 'react';

function FolderContent() {
    const [folderPath, setFolderPath] = useState('');
    const [files, setFiles] = useState([]);

    const handlePathChange = (event) => {
        setFolderPath(event.target.value);
    };

    const handleRetrieveClick = () => {
        // Send the folder path to the main Electron process
        window.api.send('getFolderContents', folderPath);
    };

    useEffect(() => {
        // Receive folder contents from the main Electron process
        window.api.receive('folderContents', (data) => {
            if (data.success) {
                setFiles(data.files);
            } else {
                console.error(data.error);
            }
        });
    }, []);

    return (
        <div>
            <input type="text" value={folderPath} onChange={handlePathChange} />
            <button onClick={handleRetrieveClick}>Retrieve Folder Content</button>
            <ul>
                {files.map((file) => (
                    <li key={file}>{file}</li>
                ))}
            </ul>
        </div>
    );
}

export default FolderContent;
