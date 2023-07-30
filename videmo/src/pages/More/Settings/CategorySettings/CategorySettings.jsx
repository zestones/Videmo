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
    const [editingCategory, setEditingCategory] = useState(null);


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
                .then((name) => setCategories([...categories, { ...name, id: name }]))
                .catch((error) => console.error(error));
        }
    };

    const handleDeleteCategory = (categoryId) => {
        // Delete the category with the given id
        categoryApi.deleteCategory(categoryId)
            .then(() => setCategories(categories.filter((category) => category.id !== categoryId)))
            .catch((error) => console.error(error));
    };

    const handleUpdateCategory = (categoryId) => {
        // Update the category name with the new name
        const updatedCategories = categories.map((category) =>
            category.id === categoryId ? { ...category, name: editingCategory.name } : category
        );

        categoryApi.updateCategory(updatedCategories.find((category) => category.id === categoryId))
            .then(() => setCategories(updatedCategories))
            .catch((error) => console.error(error));

        setEditingCategory(null);
    };

    return (
        <>
            <ul className={styles.categoryList}>
                {categories?.map((category, index) => (
                    <li key={index} className={styles.categoryItem}>
                        {editingCategory?.id === category.id ? (
                            <input
                                type="text"
                                className={styles.editInput}
                                value={editingCategory.name}
                                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory(category.id)}
                                autoFocus
                            />
                        ) : (
                            <p className={styles.categoryName}>{category.name}</p>
                        )}
                        <div className={styles.categoryIcons}>
                            {editingCategory?.id === category.id ? (
                                <CheckCircleIcon className={styles.editIcon} onClick={() => handleUpdateCategory(category.id)} />
                            ) : (
                                <EditOutlinedIcon className={styles.editIcon} onClick={() => setEditingCategory(category)} />
                            )}
                            <DeleteForeverIcon className={styles.deleteIcon} onClick={() => handleDeleteCategory(category.id)} />
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