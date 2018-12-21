<p align="center"><img src="https://laravel.com/assets/img/components/logo-laravel.svg"></p>

## About NEA Strong

Collaboration tool for tracking events, tasks and notes for archiving and easy retrieval. 

## Usage

## Overview
Manages interaction with API to fetch and store changes to results. 

## Available Props
`itemModel` - **REQUIRED** Name of Model CRUD is responsible, in snake_case

`itemName` - **REQUIRED** Display name for the CRUD

`basePath` - Base path for the model, if other than /model(s). See Paths for details

`getPath` - Custom path to API for fetching items

`createPath` - Custom path to API for creating item

`updatePath` - Custom path to API for updating item

`deletePath` - Custom path to API for deleting item

`seedResults` - Accepts array of results instead of calling API path to fetch items

`additionalFields` - Object of items to add to each item prior to submission to API

`itemCallback` - Accepts object of item fields with functions that will be run anytime 
the specified field is processed through `parseFormData`
    
    Example
    <crud :itemCallback="{users: formatUsers}"></crud>
    
    methods() {
        formatUsers(users) {
            // Format users
            return _.map(users, function(user) {
                return user.id;
            });
        },
    } 
    
`no-modal-footer` - Disables the footer for the modal window. Requires addition of custom action buttons

`no-modal-buttons` - Removes buttons from modal footer, but keeps footer. Allows for insertion of 
custom buttons in `footer-button` slot. 

`handle-errors` - Boolean - Disables toast notification triggered by catch() method for axios call.

## Paths
Paths are determined by pluralizing `itemModel` and adding to `path`
(i.e. `itemModel: user` becomes `users`)

Action | Method | Default 
-------|--------|---------
createItem | POST | /`basePath`/itemModel + 's'`
updateItem | PUT | /`basePath`/`itemModel + 's'`/item_id
deleteItem | DELETE | /`basePath`/`itemModel + 's'`/item_id
saveItems | POST | /`basePath`/itemModel + 's'`

## Methods
`parseFormData`

Loops over all results and creates FormData object

`fetchItems`

Makes call to API to retrieve results

`submitForm`, `createForm`, `editForm`, `deleteForm`

Opens modal, populates (and clears) data into form. **When using `editForm` the item is cloned 
and becomes separate item, requiring results array to be refreshed to contain current data**

`createItem`, `updateItem`, `deleteItem`

Parses form data and submits to the respective default or specified path

`saveItems`

Process entire `results` array and submits to `createItem` path, or pass array of items to save

`pushItem`

Add item to results array

`popItem`

Remove item with specified index from array 

## Listeners
Trigger events in the crud by assigning a reference to the instance and using `$emit`

    Example
    <crud ref="crud"></crud>
    
    methods() {
            createUser(user) {
                // ... do something
                this.$refs.crud.$emit('create-form');
            },
        } 
        
`create-form`, `edit-form`, `submit-form` - Creates blank form or accepts item as input to populate fields
`create-item`, `update-item`, `delete-item` - Accepts item as input then process expected 

## Emitters
`crud-initialized`

Emitted when CRUD is `created()`

`fetch-items`

Only emitted when using seed results, to trigger parent call to update results

`item-saved`

After item is successfully added or updated to the database.

`item-created`
 
After NEW item is successfully saved to database.
 
`item-updated`
  
After EXISTING item is successfully updated in the database
  
`item-deleted`
   
After item is successfully removed from the database

`item-pushed`

After item is successfully added to the results array

`item-popped`

After item is successfully removed from the results array

## Slots
`modal-footer` - Displays footer for modal window.

**DEFAULT** - Displayed with Submit and Cancel buttons.

**SCOPE** - None 

`footer-button` - Displays inside footer of modal window.

**DEFAULT** - Empty

**SCOPE** - `item`, `submitForm`, `cancelForm`, `createItem`, `editItem`, `deleteItem`

