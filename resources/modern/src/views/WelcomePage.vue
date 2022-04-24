<template>
    <v-app>
        <v-main>
            <v-container fluid className="v-container-fluid">
                <h1>Welcome page!</h1>
                <span> {{ databaseMessage.name }} по цене  {{ databaseMessage.price }}</span>
            </v-container>

            <v-snackbar v-model="message.show">
                {{ message.text }}
            </v-snackbar>
        </v-main>
    </v-app>
</template>

<script>
import axios from 'axios'
import {
    GET_GIFTS_LIST
} from '../../constants.js'

export default {
    name: 'PricesSync',
    created() {
        document.title = 'Wedding agency';
    },
    components: {
    },

    props: {
    },

    data: () => ({
        databaseMessage: '',
    }),

    mounted() {
        this.getData();
    },

    computed: {
    },

    methods: {
        getData() {
            console.log( this.apiUrl + GET_GIFTS_LIST);
            axios.post(this.apiUrl + GET_GIFTS_LIST, {
                    data_1: 'hello from front!',
                }
            ).then((response) => {
                console.log(response.data.result)
                this.databaseMessage = response.data.result
            }).catch(() => {
                console.log('catch')
            }).finally(() => {
                console.log('finally')
            });
        },
    },
};
</script>

<style scoped>
</style>
