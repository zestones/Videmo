import React from "react";

// External
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MenuIcon from '@mui/icons-material/Menu';

// Styles
import styles from "./CategoryCard.module.scss";

function CategoryCard({ category, provided, snapshot, editingCategory, setEditingCategory, handleDeleteCategory, handleUpdateCategory }) {
    return (
        <li
            ref={provided.innerRef}
            snapshot={snapshot}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={styles.categoryItem}
        >
            <div className={styles.content}>
                <MenuIcon className={styles.dragIcon} />

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
            </div>
            <div className={styles.categoryIcons}>
                {editingCategory?.id === category.id ? (
                    <CheckCircleIcon className={styles.editIcon} onClick={() => handleUpdateCategory(category.id)} />
                ) : (
                    <EditOutlinedIcon className={styles.editIcon} onClick={() => setEditingCategory(category)} />
                )}
                <DeleteForeverIcon className={styles.deleteIcon} onClick={() => handleDeleteCategory(category.id)} />
            </div>
        </li>
    );
}

export default CategoryCard;