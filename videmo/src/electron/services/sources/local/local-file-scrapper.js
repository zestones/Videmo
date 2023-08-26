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
        const serie = await this.serieDAO.getSerieByLink(this.serieLink);

        const level = this.folderManager.retrieveLevel(this.extensionLink, this.serieLink);
        const basename = this.folderManager.getBasenameByLevel(this.serieLink, level);

        const baseLink = this.extensionLink + path.sep + basename;

        if (serie === undefined) {
            this.#scrapEntireSeries(baseLink, serie.extension_id);
        } else {
            this.#scrapMissingPartOfTheSeries(baseLink, basename, serie.extension_id, serie.id);
        }
    }

    async #scrapEntireSeries(baseLink, extensionId) {
        console.log('Scraping the entire serie');

        const tree = this.tree.retrieveLocalTree(baseLink);
        this.tree.saveTreeToFile(tree, './tree.json');

        // Insert the tree in the database
        await this.tree.insertTree(tree, baseLink, extensionId);
    }

    async #scrapMissingPartOfTheSeries(baseLink, basename, parentId) {
        // Only scrap the missing part of the tree
        console.log('Scraping the missing part of the tree');

        // Difference between the tree in the database and the tree on the disk
        const databaseTree = this.tree.retrieveDatabaseTree(baseLink);

        this.folderManager.saveTreeToFile(databaseTree, './databaseTree.json');
    }
}

module.exports = LocalFileScrapper;