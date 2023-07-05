
# API Documentation

This documentation lists all the routes available in the API, as well as the expected responses. The API is divided into 4 main routes: `SERIES`, `CATEGORY`, `SERIE CATEGORIES` and `EXTENSION`. Each route has its own set of routes and responses. The API is also divided into 4 main types of requests: `CREATE`, `READ`, `UPDATE` and `DELETE`.


<details>
<summary><strong>SERIES</strong></summary>

| Route                                | Description                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `/read/all/series/by/category/`      | This route is used to retrieve all series by category ID.                                               |
| `/read/extension/by/serie/id/`       | This route is used to retrieve extensions by serie ID.                                                  |
| `/read/serie/by/serie-object/`       | This route is used to retrieve a serie by serie object.                                                 |
<details>
<summary><strong>Response Examples</strong></summary>

### Read All Series by Category ID Response

```json
{
    "success": true,
    "series": [
    {
        "id": "1",
        "name": "Series 1",
        "categoryId": "category-id-1"
    },
    {
        "id": "2",
        "name": "Series 2",
        "categoryId": "category-id-2"
    },
    {
        "id": "3",
        "name": "Series 3",
        "categoryId": "category-id-1"
    }
    ]
}
```

### Read Extensions by Serie ID Response

```json
{
    "success": true,
    "extension": {
        "id": "extension-id",
        "link": "Extension Link",
        "name": "Extension Name",
        "local": true
    }
}
```

</details>
</details>

---

<details>
<summary><strong>CATEGORY</strong></summary>

| Route                         | Description                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| `/create/category/`           | This route is used to add a new category.                       |
| `/read/all/categories/`       | This route is used to retrieve all categories.                  |
| `/delete/category/{id}/`      | This route is used to delete a category by its ID.              |


<details>
<summary><strong>Response Examples</strong></summary>

### Create Category Response

```json
{
  "success": true,
  "category": {
    "name": "Category Name"
  }
}
```

### Read Categories Response

```json
{
  "success": true,
  "categories": [
    {
        "id": "1",
        "name": "Category 1"
    },
    {
        "id": "2",
        "name": "Category 2"
    },
    {
        "id": "3",
        "name": "Category 3"
    }
  ]
}
```

### Delete Category Response

```json
{
    "success": true,
    "category": {
        "id": "category-id"
    }
}
```

</details>
</details>

---

<details>
<summary><strong>SERIE CATEGORIES</strong></summary>

| Route                                      | Description                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `/read/serie-categories/by/serie`          | This route is used to retrieve categories by serie, the unique constraint is on the name, basename and link column of the table.                                                      |
| `/add/categories/to/serie`                 | This route is used to add categories to a serie.                                                              |

<details>
<summary><strong>Response Examples</strong></summary>

### Read Serie Categories by Serie Name Response

```json
{
    "success": true,
    "categories": [
    {
        "id": "category-id-1",
        "name": "Category 1"
    },
    {
        "id": "category-id-2",
        "name": "Category 2"
    },
    {
        "id": "category-id-3",
        "name": "Category 3"
    }
    ]
}
```

### Add Categories to Serie Response

```json
{
    "success": true,
    "category": {
        "id": "categoriesId"
    }
}
```

</details>
</details>

---

<details>
<summary><strong>EXTENSION</strong></summary>

| Route                          | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `/create/extension/`           | This route is used to add a new extension.                         |
| `/read/all/extensions/`       | This route is used to retrieve all extensions.                     |
| `/delete/extension/`           | This route is used to delete an extension by its ID.               |

<details>
<summary><strong>Response Examples</strong></summary>

### Create Extension Response

```json
{
    "success": true,
    "extension": {
        "id": "Extension ID",
        "link": "Extension Link",
        "name": "Extension Name",
        "local": true
    }
}
```

### Read Extensions Response

```json
{
    "success": true,
    "extensions": [
    {
        "id": "1", 
        "link": "Extension 1 Link",
        "name": "Extension 1 Name",
        "local": true
    },
    {
        "id": "2",
        "link": "Extension 2 Link",
        "name": "Extension 2 Name",
        "local": false
    },
    {
        "id": "3",
        "link": "Extension 3 Link",
        "name": "Extension 3 Name",
        "local": true
    }
  ]
}
```

### Delete Extension Response

```json
{
    "success": true,
    "extension": {
        "id": "extension-id"
    }
}
```
</details>
</details>

---
