import React, { useState, useEffect, useMemo } from "react";

// Components
import Dropdown from "../../../components/Dropdown/Dropdown";

// Api
import ExtensionApi from "../../../services/api/extension/ExtensionApi";
import CategoryApi from "../../../services/api/category/CategoryApi";

// Styles
import styles from "./Settings.module.scss";
import Header from "../../../components/Header/Header";
import SourceSettings from "./SourceSettings/SourceSettings";


function Settings() {
    const extensionApi = useMemo(() => new ExtensionApi(), []); // Create a new instance of the extensionApi
    const categoryApi = useMemo(() => new CategoryApi(), []); // Create a new instance of the categoryApi

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Get the list of categories from the database
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => console.error(error));
    }, [extensionApi, categoryApi]);


    const handleCreateCategory = (event) => {
        event.preventDefault();

        const categoryName = event.target[0].value;

        // Create a new category with the name entered by the user
        categoryApi.createCategory(categoryName)
            // Update the array of categories by adding the new category
            .then((category) => setCategories([...categories, category]))
            .catch((error) => console.error(error));
    };

    return (
        <div className={styles.settings}>
            <Header title="Paramètres" />
            <Dropdown
                title="List of extensions"
                content={<SourceSettings />}
            />
            <Dropdown
                title="List of categories"
                content={
                    <>
                        <ul>
                            {categories &&
                                categories.map((category) => (
                                    <li key={category.id}>
                                        <p>{category.name}</p>
                                    </li>
                                ))}
                        </ul>

                        <h2>Create a new category</h2>
                        <form onSubmit={handleCreateCategory}>
                            <input type="text" placeholder="Category name" />
                            <button type="submit">Create</button>
                        </form>
                    </>
                }
            />
        </div>
    );
}

export default Settings;
