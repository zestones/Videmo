const fs = require('fs');
const path = require('path');

const SerieDAO = require('../../services/dao/series/SerieDAO');
const FolderManager = require('../folderManager/FolderManager');
const SerieTrackDAO = require('../../services/dao/series/SerieTrackDAO');
const SerieEpisodeDAO = require('../../services/dao/series/SerieEpisodeDAO');
const ExtensionsDAO = require('../../services/dao/settings/ExtensionsDAO');
const SerieInfosDAO = require('../../services/dao/series/SerieInfosDAO');


class Tree {
    constructor() {

        this.status = { ADDED: 'added', REMOVED: 'removed', MODIFIED: 'modified' };
        this.type = { DIRECTORY: 'directory', FILE: 'file' };

        this.serieDAO = new SerieDAO();
        this.extensionsDAO = new ExtensionsDAO();
        this.serieTrackDAO = new SerieTrackDAO();
        this.serieEpisodeDAO = new SerieEpisodeDAO();
        this.serieInfosDAO = new SerieInfosDAO();

        this.folderManager = new FolderManager();
    }

    async retrieveDatabaseTree(baseLink) {
        const root = await this.serieDAO.getSerieByLink(baseLink);
        const tree = {};

        if (!root) return tree;
        return await this.#retrieveDatabaseTree(baseLink);
    }

    async #retrieveDatabaseTree(baseLink) {
        const serie = await this.serieDAO.getSerieByLink(baseLink);
        const tree = {
            type: this.type.DIRECTORY,
            name: serie.name,
            content: [],
        };

        if (serie) {
            const children = await this.serieDAO.getSerieChildren(serie.id);

            for (const child of children) {
                tree.content.push(await this.#retrieveDatabaseTree(child.link));
            }

            const episodes = await this.serieEpisodeDAO.getAllEpisodesBySerieLink(baseLink);

            for (const episode of episodes) {
                tree.content.push({ type: this.type.FILE, name: episode.name, modified: episode.hash });
            }
        }

        return tree;
    }

    async insertTree(tree, baseLink, extensionId, basename = null, parentId = null, link = null, depth = 0) {
        // Insert the tree in the database
        await this.#insertTree(tree, baseLink, basename || tree.name, extensionId, parentId, link, depth);
    }

    async #insertTree(tree, baseLink, basename, extensionId, parentId = null, link = null, depth = 0) {
        let totalEpisodes = 0; // Initialize total episodes count for the current series directory
        const newLink = link ? link + path.sep + tree.name : baseLink + path.sep + tree.name;

        if (tree.type === this.type.DIRECTORY && tree.name !== 'Cover') {
            const serie = await this.#insertDirectory(tree, basename, extensionId, newLink, parentId, depth);
            const children = tree.content;

            for (const child of children) {
                const childTotalEpisodes = await this.#insertTree(child, baseLink, basename, extensionId, serie.id, newLink, depth + 1);

                // Add the count of child episodes to the current series
                totalEpisodes += childTotalEpisodes;
            }
        } else if (tree.type === this.type.FILE) {
            await this.#insertFile(tree, parentId, link);
            totalEpisodes++;
        }

        // Check if it's a series directory and insert/update SerieInfos table only if it contains episodes (files)
        if (tree.type === this.type.DIRECTORY && totalEpisodes > 0) {
            // Update the total number of episodes of the serie

            // Retrieve the serie id
            const serie = await this.serieDAO.getSerieByLink(newLink);

            // Insert inside the SerieInfos table the number of episodes of each serie
            await this.serieInfosDAO.updateSerieInfos(serie.id, { numberOfEpisodes: totalEpisodes });
        }

        return totalEpisodes;
    }

    async #insertDirectory(tree, basename, extensionId, link, parentId = null, depth = 0) {
        const image = this.folderManager.getCoverImagePath(link, 'Cover', depth);

        const serie = {
            basename: basename,
            name: tree.name,
            image: image,
            link: link,
            extension_id: extensionId,
            parent_id: parentId,
            inLibrary: 0,
        };

        return await this.serieDAO.createSerie(serie);
    }

    async #insertFile(tree, serieId, link) {
        const episode = {
            name: tree.name,
            link: this.folderManager.accessFileWithCustomProtocol(link + path.sep + tree.name),
            viewed: 0,
            bookmarked: 0,
            played_time: 0,
            hash: tree.modified,
        };

        const childEpisode = await this.serieEpisodeDAO.createEpisode(episode);
        await this.serieTrackDAO.createSerieTrack(serieId, childEpisode.id);
    }

    async removeTree(tree, baseLink) {
        if (tree.type === this.type.DIRECTORY) {
            const newLink = baseLink + path.sep + tree.name;
            const serie = await this.serieDAO.getSerieByLink(newLink);
            const children = tree.content;

            for (const child of children) {
                await this.removeTree(child, baseLink + path.sep + tree.name);
            }

            await this.serieDAO.deleteSerieById(serie.id);
        } else if (tree.type === this.type.FILE) {
            const test = this.folderManager.accessFileWithCustomProtocol(baseLink + path.sep + tree.name);
            const episode = await this.serieEpisodeDAO.getEpisodeByLink(test);

            await this.serieEpisodeDAO.deleteEpisodeById(episode.id);
            await this.serieTrackDAO.deleteSerieTrackByEpisodeId(episode.id);
        }
    }

    async updateTree(tree, extensionLink, extensionId) {
        const parentLink = tree.link.split(path.sep).slice(0, -1).join(path.sep);
        const link = extensionLink + path.sep + parentLink;

        if (tree.status === this.status.ADDED) {
            // retrieve the parent of tree.link
            const parentSerie = await this.serieDAO.getSerieByLink(extensionLink + path.sep + parentLink);
            const baseLink = extensionLink + path.sep + tree.link.split(path.sep)[0]; // We add the root folder
            
            const depth = this.folderManager.retrieveLevel(baseLink, link);
            await this.insertTree(tree.node, baseLink, extensionId, parentSerie.basename, parentSerie.id, link, depth);

            // retrieve all the parent from a link serie
            const allParentSeries = await this.serieDAO.getAllParentSeries(parentSerie.link);

            for (const parentSerie of allParentSeries) {
                const numberOfEpisodes = this.countAddedFiles(tree.node);
                await this.serieInfosDAO.updateNumberOfEpisodesWithIncrement(parentSerie.id, numberOfEpisodes)
            }


        } else if (tree.status === this.status.REMOVED) {
            const baseLink = (extensionLink + path.sep + tree.link).split(path.sep).slice(0, -1).join(path.sep);
            await this.removeTree(tree.node, baseLink);

            // retrieve all the parent from a link serie
            const allParentSeries = await this.serieDAO.getAllParentSeries(link);

            for (const parentSerie of allParentSeries) {
                await this.serieInfosDAO.updateNumberOfEpisodesWithIncrement(parentSerie.id, -1)
            }

        } else if (tree.status === this.status.MODIFIED) {
            // For now we do nothing
        }
    }

    compareTrees(localTree, databaseTree) {
        const differences = [];

        const compareNodes = (localNode, databaseNode, link) => {
            if (!localNode && databaseNode) {
                differences.push({ status: this.status.ADDED, link, node: databaseNode });
            } else if (localNode && !databaseNode) {
                differences.push({ status: this.status.REMOVED, link, node: localNode });
            } else if (localNode.type !== databaseNode.type) {
                differences.push({ status: this.status.MODIFIED, link, localNode, databaseNode });
            } else if (localNode.type === this.type.DIRECTORY) {
                compareDirectories(localNode, databaseNode, link);
            } else if (localNode.type === this.type.FILE && localNode.modified !== databaseNode.modified) {
                differences.push({ status: this.status.MODIFIED, link, node: localNode });
            }
        }

        const compareDirectories = (localDir, databaseDir, link) => {
            const localContentMap = new Map();
            const databaseContentMap = new Map();

            for (const node of localDir.content) {
                localContentMap.set(node.name, node);
            }

            for (const node of databaseDir.content) {
                databaseContentMap.set(node.name, node);
            }

            for (const [name, localNode] of localContentMap) {
                const databaseNode = databaseContentMap.get(name);
                compareNodes(localNode, databaseNode, link + path.sep + name);
            }

            for (const [name, databaseNode] of databaseContentMap) {
                if (!localContentMap.has(name)) {
                    compareNodes(undefined, databaseNode, link + path.sep + name);
                }
            }
        }

        compareNodes(localTree, databaseTree, localTree.name);
        return differences;
    }

    retrieveLocalTree(folderPath, folderName = null) {
        if (folderName === null) {
            const stats = fs.statSync(folderPath);
            return this.#retrieveLocalTree(folderPath, stats);
        }
        const tree = {
            name: folderName,
            type: this.type.DIRECTORY,
            content: [this.#retrieveLocalTree(folderPath)],
        };

        return tree;
    }

    #retrieveLocalTree(entryPath, stats = null) {
        const tree = {};

        if (!stats) {
            stats = fs.statSync(entryPath);
        }

        if (stats.isDirectory()) {
            tree.name = path.basename(entryPath);
            tree.type = this.type.DIRECTORY;
            tree.content = [];

            const contents = fs.readdirSync(entryPath);
            for (const entry of contents) {
                const fullPath = path.join(entryPath, entry);
                const entryStats = fs.statSync(fullPath);
                tree.content.push(this.#retrieveLocalTree(fullPath, entryStats));
            }
        } else {
            tree.name = path.basename(entryPath);
            tree.type = this.type.FILE;
            tree.modified = stats.mtimeMs; // Modification time in milliseconds
        }

        return tree;
    }

    removeDirectoryFromTree(tree, directoryName) {
        const newTree = {
            name: tree.name,
            type: tree.type,
            content: [],
        };

        if (tree.type === this.type.DIRECTORY) {
            for (const node of tree.content) {
                if (node.name !== directoryName) {
                    newTree.content.push(this.removeDirectoryFromTree(node, directoryName));
                }
            }
        } else {
            // delete the content node :
            newTree.modified = tree.modified;
            delete newTree.content;
        }

        return newTree;
    }

    countAddedFiles(node) {
        if (node.type === "file") return 1;
        else if (node.type === "directory" && node.content) {
            let fileCount = 0;
            for (const childNode of node.content) {
                fileCount += this.countAddedFiles(childNode);
            }
            return fileCount;
        }
        else return 0;
    }

    saveTreeToFile(tree, filePath) {
        const jsonTree = JSON.stringify(tree, null, 4);
        fs.writeFileSync(filePath, jsonTree);
        console.log('Tree saved to', filePath);
    }
}

module.exports = Tree;