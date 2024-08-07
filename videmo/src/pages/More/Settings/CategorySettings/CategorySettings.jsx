import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// External
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Notification from "../../../../components/Notification/Notification";

// Api
import ExtensionApi from "../../../../services/api/extension/ExtensionApi";
import CategoryApi from "../../../../services/api/category/CategoryApi";

// Components
import CategoryCard from "../../../../components/Card/CategoryCard/CategoryCard";

// Styles
import styles from "./CategorySettings.module.scss";


function CategorySettings() {
    // Services initialization
    const extensionApi = useMemo(() => new ExtensionApi(), []);
    const categoryApi = useMemo(() => new CategoryApi(), []);

    // State initialization
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        // Get the list of categories from the database
        categoryApi.readAllCategories()
            .then((data) => {
                setCategories(data)
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError({ message: error.message, type: "error" });
            });
    }, [extensionApi, categoryApi]);


    const handleCreateCategory = (event) => {
        if (event.key === "Enter" && newCategoryName.trim() !== "") {
            setNewCategoryName(""); // Reset the input value

            // We retrieve the last order_id of the categories + 1
            const lastCategoryId = categories[categories.length - 1]?.id || 0;

            // Create a new category with the name entered by the user
            categoryApi.createCategory(newCategoryName, lastCategoryId + 1)
                .then((category) => setCategories([...categories, category]))
                .catch((error) => {
                    console.error(error);
                    setError({ message: error.message, type: "error" })
                });
        }
    };

    const handleDeleteCategory = (categoryId) => {
        // Delete the category with the given id
        categoryApi.deleteCategory(categoryId)
            .then(() => setCategories(categories.filter((category) => category.id !== categoryId)))
            .catch((error) => {
                console.error(error);
                setError({ message: error.message, type: "error" });

            });
    };

    const handleUpdateCategory = (categoryId) => {
        // Update the category name with the new name
        const updatedCategories = categories.map((category) =>
            category.id === categoryId ? { ...category, name: editingCategory.name } : category
        );

        categoryApi.updateCategory(updatedCategories.find((category) => category.id === categoryId))
            .then(() => setCategories(updatedCategories))
            .catch((error) => {
                console.error(error);
                setError({ message: error.message, type: "error" });
            });

        setEditingCategory(null);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedCategories = [...categories];
        const [movedCategory] = reorderedCategories.splice(result.source.index, 1);
        reorderedCategories.splice(result.destination.index, 0, movedCategory);

        // Update the order_id of each category
        const reorderedCategoriesWithId = reorderedCategories.map((category, index) => ({ ...category, order_id: index + 1 }));

        categoryApi.updateCategoriesOrder(reorderedCategoriesWithId)
            .catch((error) => {
                console.error(error);
                setError({ message: error.message, type: "error" })
            });

        // Update the state with the new order of categories
        setCategories(reorderedCategories);
    };

    return (
        <>
            {error && <Notification type={error.type} message={error.message} onClose={setError} />}
            <DragDropContext onDragEnd={handleDragEnd}>
                {!isLoading && (
                    <Droppable droppableId="droppable">
                        {(provided) => (
                            <ul className={styles.categoryList} {...provided.droppableProps} ref={provided.innerRef}>
                                {categories.map((category, index) => (
                                    <Draggable key={category.name} draggableId={category.name} index={index}>
                                        {(provided, snapshot) => (
                                            <CategoryCard
                                                category={category}
                                                provided={provided}
                                                snapshot={snapshot}
                                                editingCategory={editingCategory}
                                                setEditingCategory={setEditingCategory}
                                                handleUpdateCategory={handleUpdateCategory}
                                                handleDeleteCategory={handleDeleteCategory}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                )}
            </DragDropContext>
            <hr className={styles.separator} />

            <div className={styles.form}>
                <input
                    type="text"
                    placeholder="Category name"
                    className={styles.formInput}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => handleCreateCategory(e)}
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