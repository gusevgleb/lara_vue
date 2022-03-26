<template>
    <div>
        <v-row>
            <v-col md="1">
                <v-menu
                    ref="menu"
                    v-model="menu"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="dateFrom"
                            label="Дата начала"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            dense
                        ></v-text-field>
                    </template>
                    <v-date-picker
                        v-model="dateFrom"
                        :active-picker.sync="activePicker"
                        :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                        min="2021-01-01"
                        @change="save"
                    ></v-date-picker>
                </v-menu>
            </v-col>
            <v-col md="1">
                <v-menu
                    ref="menu"
                    v-model="menu1"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="dateTo"
                            label="Дата окончания"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            dense
                        ></v-text-field>
                    </template>
                    <v-date-picker
                        v-model="dateTo"
                        :active-picker.sync="activePicker"
                        :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                        min="2021-01-01"
                        @change="save"
                    ></v-date-picker>
                </v-menu>
            </v-col>
            <v-col>
                <v-btn
                    class="white--text text-transform-none"
                    color="primary"
                    elevation="0"
                    @click="requestStats"
                    v-bind="attrs"
                    :loading="loading"
                    :disabled="loading"
                >
                    Получить статистику
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    name: "DatePicker",

    data: () => ({
        activePicker: null,
        dateFrom: null,
        dateTo: null,
        menu: false,
        menu1: false,
    }),
    methods: {
        saveDateFrom(date) {
            this.dateFrom = date;
        },
        saveDateTo(date) {
            this.dateTo = date;
        },
        requestStats() {
            let dateValFrom = new Date(this.dateFrom)
            let dateValTo = new Date(this.dateTo)

            // если первая дата < второй, - меняем их местами
            if (dateValFrom > dateValTo) {
                [this.dateTo, this.dateFrom] = [this.dateFrom, this.dateTo]
            }

            if (this.dateFrom !== null && this.dateTo !== null) {
                this.$emit('get-stats', this.dateFrom, this.dateTo)
            }
        },
    },
}
</script>

<style scoped>

</style>
