<template>
    <div id="crud">
        <div class="crud-header">
            <slot name="header"
                  :createForm="createForm"
                  :items="results"
            ></slot>
        </div>
        <div class="crud-content">
            <slot name="results"
                  :items="results"
                  :createForm="createForm"
                  :editForm="editForm"
                  :deleteForm="deleteForm"
                  :getItems="fetchItems"
                  :pushItem="pushItem"
                  :popItem="popItem"
                  :createItem="createItem"
                  :updateItem="updateItem"
                  :deleteItem="deleteItem"
                  :saveItems="saveItems"
            ></slot>
        </div>
        <div class="crud-footer">
            <slot name="footer" :saveItems="saveItems"></slot>
        </div>
        <div class="crud-modal">
            <el-dialog
                    :title="title"
                    :visible.sync="showForm"
                    :close-on-click-modal="false"
                    :width="modalWidth + '%'"
                    custom-class="p-0"
                    top="2vh"
                    @open="$emit('modal-open')">
                <slot name="header"></slot>
                <slot name="modal"
                      :item="item"
                      :submitForm="submitForm"></slot>
                <span slot="footer" class="dialog-footer w-100" v-if="noModalFooter">
                    <div class="row">
                        <div class="col">
                            <div class="text-center">
                                <n-button type="primary" round="" @click.native="submitForm()" v-if="noModalButtons">Save</n-button>
                                <n-button type="default" round="" @click.native="cancelForm()" v-if="noModalButtons">Cancel</n-button>
                                <slot name="footer-button"
                                      :item="item"
                                      :submitForm="submitForm"
                                      :cancelForm="cancelForm"
                                      :createItem="createItem"
                                      :updateItem="updateItem"
                                      :deleteItem="deleteItem"
                                ></slot>
                            </div>
                        </div>
                    </div>
                  </span>
            </el-dialog>
        </div>

        <!-- DELETE CONFIRM -->
        <modal :show.sync="showDeleteConfirm" footer-classes="justify-content-center">
            <h4 slot="header" class="title title-up">Delete {{itemName}}</h4>
            <p v-html="deleteMessage"></p>
            <template slot="footer">
                <n-button type="default" round="" @click.native="cancelForm()" class="mr-1">Cancel</n-button>
                <n-button type="danger" round="" @click.native="submitForm()">Delete</n-button>
            </template>
        </modal>


        <button class="btn btn-primary" @click="showDeleteConfirm = true">test</button>
    </div>
</template>
<script>
    import {Dialog} from 'element-ui';
    import {Button, Modal} from './components';

    export default {
        components: {
            [Dialog.name]: Dialog,
            [Button.name]: Button,
            Modal
        },
        name: "crud",
        props: {
            itemModel: String,
            itemName: String,
            basePath: String,
            createPath: String,
            updatePath: String,
            deletePath: String,
            getPath: String,
            seedResults: null,
            additionalFields: Object,
            itemCallback: Object,
            modalWidth: {
                type: Number,
                default: 80
            },
            noModalFooter: {
                type: Boolean,
                default: true
            },
            noModalButtons: {
                type: Boolean,
                default: true,
            },
            catchErrors: {
                type: Boolean,
                default: true,
            }
        },
        data() {
            return {
                results: [],
                item: {},
                showForm: false,
                showDeleteConfirm: false,
                deleteMessage: 'Are you sure you want to delete this item?',
                title: '',
            }
        },
        created() {
            this.$emit('crud_initialized');
            if (!this.seedResults) this.fetchItems();

            // Create listeners
            this.$on('refresh', () => {
                this.fetchItems();
            });
            this.$on('save-items', () => {
                this.saveItems();
            });
            this.$on('create-form', (item) => {
                this.createForm(item);
            });
            this.$on('edit-form', (item) => {
                this.editForm(item);
            });
            this.$on('submit-form', (item) => {
                this.submitForm();
            });
            this.$on('create-item', (item) => {
                this.createItem(item);
            });
            this.$on('update-item', (item) => {
                this.updateItem(item);
            });
            this.$on('delete-item', (item) => {
                this.deleteItem(item);
            });
        },
        updated() {
            // Load results
            if (this.seedResults) this.results = this.seedResults;
        },

        computed: {
            path() {
                return '/' + this.basePath + '/' + this.itemModel + 's';
            },
        },

        methods: {
            parseFormData(data) {
                let formData = new FormData();

                // Add values to the FormData object
                _.forEach(data, (value, key) => {
                    // Format fields if requested, otherwise add the field
                    if (!_.isEmpty(this.itemCallback) && _.isFunction(this.itemCallback[key])) {
                        let data = this.itemCallback[key](value, formData);
                        if (data) formData.append(key, data);
                    } else {
                        // Stringify objects
                        if (_.isObject(value)) {
                            formData.append(key, JSON.stringify(value));
                        } else {
                            formData.append(key, value);
                        }
                    }
                });

                return formData;
            },
            fetchItems() {
                // If using seeded results, prevent fetch
                if (this.seedResults) {
                    this.$emit('fetch-items');
                    return true;
                }

                // Otherwise fetch the items
                var path = (this.getPath ? this.getPath : this.path);
                return axios.get(path)
                    .then((response) => {
                        this.results = response.data;
                        this.$emit('fetch-items');
                    })
                    .catch((response) => {
                        if (this.catchErrors) {
                            this.$notify({
                                message: 'Error retrieving items from database. Please contact an administrator.\n\r',
                                type: 'danger'
                            });
                        }
                    });
            },
            submitForm() {
                this.formAction()
                    .then(response => {
                        this.item = {};
                        // this.fetchItems(); Causing duplicate fetch
                    });
                this.showForm = false;
                this.showDeleteConfirm = false;
                this.formAction = '';
            },
            createForm(item = {}, title = null) {
                this.item = _.merge({}, item, this.additionalFields);
                this.title = title || 'New ' + this.itemName;
                this.showForm = true;
                this.formAction = this.createItem;
            },
            editForm(item, title = null) {
                this.item = JSON.parse(JSON.stringify(_.merge(item, this.additionalFields))); // Create a new instance for the item, intentionally breaks reactivity
                this.formAction = this.updateItem;
                this.title = title || 'Update ' + this.itemName;
                this.showForm = true;
            },
            deleteForm(item, message = null) {
                this.showDeleteConfirm = true;
                this.item = item;
                this.formAction = this.deleteItem;

                // Create title
                if (message) this.deleteMessage = message;
            },
            cancelForm() {
                this.showForm = false;
                this.showDeleteConfirm = false;
                this.item = {};
            },
            createItem(item = null) {
                let createItem = item || this.item;
                let data = this.parseFormData(createItem);

                // Submit data
                var path = (this.createPath ? this.createPath : this.path);
                return axios.post(path, data, {headers: {'Content-Type': 'multipart/form-data'}})
                    .then(response => {
                        this.$notify({
                            message: this.itemName + ' created successfully.',
                            type: 'success'
                        });
                        this.fetchItems();
                        this.$emit('item-created', response.data);
                        this.$emit('item-saved', response.data);
                    })
                    .catch((response) => {
                        if (this.catchErrors) {
                            this.$notify({
                                message: 'Error saving ' + this.model + ' to database. Please contact an administrator.\n\r',
                                type: 'danger'
                            });
                        }
                    });
            },
            updateItem(item = null) {
                let updateItem = item || this.item;

                let data = this.parseFormData(_.omit(updateItem, ['id']));
                data.append('_method', 'PUT');

                // Submit data
                var path = (this.updatePath ? this.updatePath : this.path + '/' + updateItem.id);
                return axios.post(path, data, {headers: {'Content-Type': 'multipart/form-data'}})
                    .then((response) => {
                        this.$notify({
                            message: this.itemName + ' updated successfully.',
                            type: 'success'
                        });
                        this.fetchItems();
                        this.$emit('item-updated');
                        this.$emit('item-saved');
                    })
                    .catch((response) => {
                        if (this.catchErrors) {
                            this.$notify({
                                message: 'Error updating ' + this.model + ' to database. Please contact an administrator.\n\r',
                                type: 'danger'
                            });
                        }
                    });
            },
            deleteItem(item = null) {
                let deleteItem = item || this.item;
                return axios.delete((this.deletePath ? this.deletePath : this.path + '/' + deleteItem.id))
                    .then((response) => {
                        this.$notify({
                            message: this.itemName + ' deleted successfully.',
                            type: 'success'
                        });
                        this.fetchItems();
                        this.$emit('item-deleted', this.item);
                    })
                    .catch((response) => {
                        if (this.catchErrors) {
                            this.$notify({
                                message: 'Error deleting ' + this.model + ' from database. Please contact an administrator.\n\r',
                                type: 'danger'
                            });
                        }
                    });
            },
            pushItem(item) {
                this.createItem(item);
                this.$emit('item-pushed', (this.results.length - 1));
            },
            popItem(item_index) {
                if (this.deleteItem(this.results[item_index])) {
                    this.results.splice(item_index, 1);
                }
                this.$emit('item-popped');
            },
            saveItems(items = null) {
                let results = items || this.results;
                let promises = [];

                _.forEach(results, (data, key) => {
                    let item = this.parseFormData(data);

                    // Submit data
                    var path = (this.createPath ? this.createPath : this.path);
                    promises.push(axios.post(path, item, {headers: {'Content-Type': 'multipart/form-data'}})
                        .catch((response) => {
                            if (this.catchErrors) {
                                this.$notify({
                                    message: 'Error saving ' + this.model + ' to database. Please contact an administrator.\n\r',
                                    type: 'danger'
                                });
                            }
                            return false;
                        })
                    )
                });

                // Make sure all requests were successful
                axios.all(promises)
                    .then(response => {
                        this.$notify({
                            message: this.itemName + ' items saved successfully.',
                            type: 'success'
                        });

                        this.$emit('items-saved');
                    });
            }
        }
    }
</script>