import React, { useState, useEffect, } from "react";

// External
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// Api
import ExtensionApi from "../../../../services/api/extension/ExtensionApi";
import CategoryApi from "../../../../services/api/category/CategoryApi";

// Styles
import styles from "./CategorySettings.module.scss";


function CategorySettings() {
    // Services initialization
    const [extensionApi] = useState(() => new ExtensionApi());
    const [categoryApi] = useState(() => new CategoryApi());

    // State initialization
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");


    useEffect(() => {
        // Get the list of categories from the database
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => console.error(error));
    }, [extensionApi, categoryApi]);


    const handleCreateCategory = () => {
        if (newCategoryName.trim() !== "") {
            setNewCategoryName(""); // Reset the input value

            // Create a new category with the name entered by the user
            categoryApi.createCategory(newCategoryName)
                .then((category) => setCategories([...categories, category]))
                .catch((error) => console.error(error));
        }
    };

    return (
        <>
            <ul className={styles.categoryList}>
                {categories?.map((category) => (
                    <li key={category.id} className={styles.categoryItem}>
                        <p className={styles.categoryName}>{category.name}</p>
                        <div className={styles.categoryIcons}>
                            <EditOutlinedIcon className={styles.editIcon} />
                            <DeleteForeverIcon className={styles.deleteIcon} />
                        </div>
                    </li>
                ))}
            </ul>

            <hr className={styles.separator} />

            <div className={styles.form}>
                <input
                    type="text"
                    placeholder="Category name"
                    className={styles.formInput}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                />
                <CheckCircleIcon
                    className={styles.createIcon}
                    onClick={handleCreateCategory}
                />
            </div>
        </>
    );
}

export default CategorySettings;