const FolderManager = require('../../../utilities/folderManager/FolderManager');
const Tree = require('../../../utilities/Tree/Tree');

const SerieDAO = require('../../dao/series/SerieDAO');
const SerieCategoryDAO = require('../../dao/series/SerieCategoryDAO');
const ExtensionsDAO = require('../../dao/settings/ExtensionsDAO');

const path = require('path');

class LocalFileScrapper {

    /**
     * 
     * @param {String} extensionLink - The base link of the serie (means the extension link).  
     * @param {*} SerieLink - The link of the parent folder of the serie.
     */
    constructor(extensionLink, serieLink = null) {
        // Utilities
        this.folderManager = new FolderManager();
        this.tree = new Tree();

        // DAOs
        this.serieDAO = new SerieDAO();
        this.extensionsDAO = new ExtensionsDAO();
        this.serieCategoryDAO = new SerieCategoryDAO();

        // Links
        this.extensionLink = extensionLink;
        this.serieLink = serieLink;
    }

    async scrap() {
        // if the serie link is null means that we should scrapp everything from the extension link
        if (this.serieLink === null) await this.#scrapExtension();
        else await this.#scrapSerie();
    }

    async #scrapExtension() {
        // retrieve the folders inside the extension
        const folders = this.folderManager.retrieveFolders(this.extensionLink);
        const extension = await this.extensionsDAO.getExtensionByLink(this.extensionLink);

        for (const folder of folders) {
            // link to the folder
            const baseLink = this.extensionLink + path.sep + folder;

            // Read all the tree of the extension in the database  
            const databaseTree = await this.tree.retrieveDatabaseTree(baseLink);
            const localTree = this.tree.retrieveLocalTree(baseLink);

            // check if the root folder does not exist in the database
            if (databaseTree?.name !== folder) {
                await this.tree.insertTree(localTree, this.extensionLink, extension.id);
            } else {
                const localTreeWithoutCovers = this.tree.removeDirectoryFromTree(localTree, 'Cover');
                const differences = this.tree.compareTrees(databaseTree, localTreeWithoutCovers);

                if (differences.length !== 0) {
                    for (const diff of differences) {
                        await this.tree.updateTree(diff, this.extensionLink, extension.id);
                    }
                }
            }
        }
    }

    async #scrapSerie() {
        const extension = await this.extensionsDAO.getExtensionByLink(this.extensionLink);

        const baseLink = this.extensionLink + path.sep + this.serieLink.split(path.sep)[this.extensionLink.split(path.sep).length];
        const serie = await this.serieDAO.getSerieByLink(baseLink);

        const localTree = this.tree.retrieveLocalTree(baseLink);

        if (serie === undefined) {
            await this.tree.insertTree(localTree, this.extensionLink);
        } else {
            const databaseTree = await this.tree.retrieveDatabaseTree(baseLink);
            const localTreeWithoutCovers = this.tree.removeDirectoryFromTree(localTree, 'Cover');
            const differences = this.tree.compareTrees(databaseTree, localTreeWithoutCovers);
            
            this.tree.saveTreeToFile(databaseTree, './databaseTree.json');
            this.tree.saveTreeToFile(differences, './differences.json');

            if (differences.length !== 0) {
                for (const diff of differences) {
                    await this.tree.updateTree(diff, this.extensionLink, extension.id);
                }
            }
        }

    }
}

module.exports = LocalFileScrapper;