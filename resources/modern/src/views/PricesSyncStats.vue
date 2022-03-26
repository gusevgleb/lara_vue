<template>
    <v-app>
        <v-main>
            <v-container fluid class="v-container-fluid">
                <h5>Всего цен обновлено: {{ total }} </h5>
                <h5>Всего услуг обновлено: {{ services }} </h5>
                <h5>Всего приёмов обновлено: {{ receptions }} </h5>

                <DatePicker
                    @get-stats="getStats"
                >
                </DatePicker>

                <StataTable
                    :stats="stats"
                    :total="total"
                    :services="services"
                    :receptions="receptions"
                >
                </StataTable>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import StataTable from "../components/PricesSyncStata/StataTable";
import DatePicker from "../components/PricesSyncStata/DatePicker";

import axios from "axios";

import {
    GET_PRICES_SYNC_STATS,
} from '../../constants'

export default {
    name: 'App',
    created () {
        document.title = 'Статистика синхронизации';
    },
    components: {
        StataTable,
        DatePicker
    },
    data() {
        return {
            stats: [],
            total: 0,
            services: 0,
            receptions: 0,
            newStats: [],
        }
    },
    mounted() {
        this.getStats()
    },
    methods: {
        getStats(from, to) {
            axios.get(this.apiUrl + GET_PRICES_SYNC_STATS, {
                params: {
                    date_from: from,
                    date_to: to,
                }
            }).then((response) => {
                this.stats = [];
                this.total = 0;
                this.services = 0;
                this.receptions = 0;

                response.data.stats.forEach((element) => {
                    this.stats.push(element);

                    this.total += element.totalSummary;
                    this.services += element.totalServices;
                    this.receptions += element.totalReceptions;
                });
            }).catch((error) => {
                console.error(error);
            });
        },
    }
}
</script>

<style>

</style>
