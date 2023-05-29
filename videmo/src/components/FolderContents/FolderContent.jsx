import React, { useState, useEffect } from 'react';

function FolderContent() {
    const [folderPath, setFolderPath] = useState('');
    const [files, setFiles] = useState([]);
    const defaultCoverName = "Cover";

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

    const getFileName = (filePath) => {
        const fileName = filePath.split('\\').pop().split('/').pop();
        return fileName;
    }

    const getCoverPath = (filePath) => {
        const fileName = getFileName(filePath);
        // Construct the file path using the custom protocol 'app://'
        const coverPath = `app:///${folderPath}/${filePath}/${defaultCoverName}/${fileName}.jpg`;
        return coverPath;
    };



    return (
        <div>
            <input type="text" value={folderPath} onChange={handlePathChange} />
            <button onClick={handleRetrieveClick}>Retrieve Folder Content</button>
            <ul>
                {files.map((file) => (
                    <li key={file}>
                        <img src={getCoverPath(file)} alt={getCoverPath(file)} />
                        <p>{getFileName(file)}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FolderContent;
