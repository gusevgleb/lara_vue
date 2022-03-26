<template>
    <v-app>
        <v-main>
            <v-container fluid class="v-container-fluid">
                <div v-if="isLogged" class="text-right">
                    <v-btn
                        color="teal"
                        @click="logOut"
                        class="mb-3"
                        depressed
                        dark
                    >Выйти</v-btn>
                </div>
                <div v-if="loading" class="text-center">
                    <v-progress-circular
                        indeterminate
                        color="teal"
                        align-center
                        class="mb-3 text-center"
                    ></v-progress-circular>
                </div>
                <v-card
                    v-if="isLogged"
                    class="mx-auto mb-3"
                    outlined
                    tile
                    :class="{'large-screen': $vuetify.breakpoint.xl}"
                >
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>
                                <h3>Тестирование окон</h3>
                            </v-list-item-title>
                            <hr class="mb-3 mt-0">
                            <ul v-for="(data, i) in slotsData" v-bind:key="i">
                                <li class="mb-1 textClinic"> {{ data.clinic }}
                                    <ul v-for="(doctors, doctor) in data.doctors" v-bind:key="doctor">
                                        <li class="textDoctor mt-2"> {{ doctor }}
                                            <ul v-for="(dates, date) in doctors" v-bind:key="date">
                                                <li class="textDate mt-2">{{ date }}, {{ getDayOfWeek(date) }}</li>
                                                <v-chip
                                                    class="mr-1 mb-2"
                                                    v-for="(slots, slot) in dates"
                                                    v-bind:key="slot"
                                                    label
                                                    color="teal"
                                                    text-color="white"
                                                >
                                                    {{ slots }}
                                                </v-chip>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </v-list-item-content>
                    </v-list-item>
                </v-card>
                <v-dialog
                    max-width="600"
                    v-model="login"
                    persistent
                    ref="dialog"
                >
                    <template>
                        <v-card>
                            <v-form
                                ref="form"
                                v-model="valid"
                            >
                                <v-toolbar
                                    color="teal"
                                    dark
                                    class="textBold"
                                >Вход</v-toolbar>
                                <v-card-text>
                                    <v-text-field
                                        label="GUID"
                                        outlined
                                        dense
                                        v-model="guid"
                                        class="mt-6"
                                        color="teal"
                                        clearable
                                        :rules="[rules.required]"
                                    ></v-text-field>
                                    <v-text-field
                                        label="CID"
                                        outlined
                                        dense
                                        v-model="cid"
                                        color="teal"
                                        clearable
                                        :rules="[rules.required]"
                                    ></v-text-field>
                                    <v-alert
                                        v-model="error"
                                        dense
                                        type="error"
                                        class="mb-0"
                                    >{{ errorMessage }}</v-alert>
                                </v-card-text>
                                <v-card-actions class="justify-end">
                                    <v-btn
                                        text
                                        color="teal"
                                        @click="getSlots"
                                        :disabled="!isValid"
                                    >Войти</v-btn>
                                </v-card-actions>
                            </v-form>
                        </v-card>
                    </template>
                </v-dialog>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import {GET_SLOTS} from "../../constants";
import axios from "axios";

function initialState() {
    return {
        guid: '',
        cid: '',
        loading: false,
        login: true,
        isLogged: false,
        slotsData: [],
        rules: {
            required: value => !!value || 'Обязательное поле',
        },
        error: false,
        errorMessage: '',
        valid: true,
        daysOfWeek: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    }
}

export default {
    name: "VisualSlots",

    created() {
        document.title = 'Слоты';

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.getSlots();
            }
        });
    },
    watch:{
        guid: function () {
            this.error = false
        },
        cid: function () {
            this.error = false
        },
    },
    computed: {
        isValid() {
            return (this.guid.length > 0 && this.cid.length > 0)
        },
    },
    data() {
        return initialState()
    },
    methods: {
        getSlots: function() {
            this.error = false

            if (this.guid.length > 0 && this.cid.length > 0) {
                this.loading = true;
                axios.get(this.apiUrl + GET_SLOTS, {
                    params: {
                        guid: this.guid,
                        cid: this.cid
                    }
                }).then((response) => {
                    response.data.data.forEach((item) => {
                        this.slotsData.push(item)
                    })

                    this.loading = false
                    this.isLogged = true
                    this.login = false
                }).catch((error) => {
                    console.error(error.response.data.error)

                    this.loading = false
                    this.errorMessage = error.response.data.error
                    this.error = true;
                })
            }
        },
        logOut: function() {
            Object.assign(this.$data, initialState())
            this.$refs.form.resetValidation()
        },
        getDayOfWeek: function(date) {
            const dayOfWeek = new Date(this.toDate(date)).getDay();

            return isNaN(dayOfWeek)
                ? null
                : this.daysOfWeek[dayOfWeek]
        },
        toDate: function(dateStr) {
            let parts = dateStr.split("-")
            return new Date(parts[2], parts[1] - 1, parts[0])
        },
    },
}
</script>

<style scoped>
    li {
        margin-bottom: 5px;
        font-weight: bold;
    }

    .textClinic {
        font-size: 18pt;
    }

    .textDoctor {
        font-size: 14pt;
    }

    .textDate {
        font-size: 12pt;
    }

    .textBold {
        font-weight: bold;
    }

    .large-screen {
        max-width: 60%;
    }
</style>
