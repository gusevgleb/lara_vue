<template>
    <div>
        <div>
            <v-text-field
                v-model="search"
                hide-details
                label="Поиск"
                class="input-search ml-3 mb-3"
                @input="filterText"
                clearable
            ></v-text-field>

            <v-data-table
                :headers="headers"
                fixed-header
                :items="filteredStats"
                :page="currentPage"
                class="elevation-1 pt-2"
                :loading="loading"
                :footer-props="footerProps"
            >
                <template v-slot:item="{ item }">
                    <tr>
                        <td class="width-30 pl-2 pt-2">
                            [#{{ item.id }}] {{ item.title }}
                        </td>
                        <td class="pl-0 pr-0 max-width-100">
                            {{ item.driver }}
                        </td>
                        <td>
                            <table class="width-100">
                                <tbody class="subtable">
                                <tr>
                                    <td >
                                        Всего цен
                                    </td>
                                    <td>
                                        {{ item.totalSummary }}
                                    </td>
                                </tr>
                                <tr>
                                    <td >
                                        Всего услуг
                                    </td>
                                    <td >
                                        {{ item.totalServices }}
                                    </td>
                                </tr>
                                <tr>
                                    <td >
                                        Всего приёмов
                                    </td>
                                    <td >
                                        {{ item.totalReceptions }}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </td>
                        <td colspan="5" class="pr-0 pl-2 pb-3 pt-3">
                            <table class="width-100">
                                <tbody class="subtable">
                                <tr v-for="element in item.filials" :key="item.id + '_' + element.id" class="">
                                    <td class="width-7 tet-left">
                                        <span>
                                            {{ element['id'] }}
                                        </span>
                                    </td>
                                    <td :class="{
                                            'sync': element.isSync !== 'no sync',
                                        }" class="width-7 pl-10">
                                        <span v-if="element.isSync === 'from file'">
                                            Да, из файла
                                        </span>
                                        <span v-else-if="element.isSync === 'directly'">
                                            Да, напрямую
                                        </span>
                                        <span v-else>
                                            Нет
                                        </span>
                                    </td>
                                    <td class="width-7">
                                        {{ element.stats.total }}
                                    </td>
                                    <td class="width-7">
                                        {{ element.stats.services }}
                                    </td>
                                    <td class="width-7">
                                        {{ element.stats.receptions }}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </div>
    </div>
</template>

<script>
import {escapeRegExp} from "../../helpers";

export default {
    name: "StataTable",
    props: [
        'stats',
    ],
    watch: {
        stats: function () {
            this.filteredStats = this.stats
            this.filterText(this.search)
        }
    },
    data() {
        return {
            currentPage: 1,

            headers: [
                {text: 'Интеграция', value: 'id', align: 'center'},
                {text: 'МИС', value: 'driver', align: 'center'},
                {text: 'Всего', value: '', align: 'center'},
                {text: 'ID филиала', value: '', align: 'center'},
                {text: 'Синхронизация?', value: 'isSync', align: 'center', filterable: false},
                {text: 'Цен', value: 'totalSummary', align: 'center', filterable: false},
                {text: 'Услуг', value: 'totalSummary', align: 'center', filterable: false},
                {text: 'Приёмов', value: 'totalSummary', align: 'center', filterable: false},
            ],

            footerProps: {
                'items-per-page-options': [-1],
                'items-per-page-text': 'Строк на странице:',
                'page-text': '{0}-{1} из {2}',
            },

            totalPrices: 0,
            totalServices: 0,
            totalReceptions: 0,

            search: '',
            filteredStats: [],
        }
    },
    methods: {
        filterText(value) {
            let integrationNameMatch = true;
            let integrationSearch = escapeRegExp(value);

            let regIntegrations = new RegExp(integrationSearch, 'i');

            this.filteredStats = this.stats.filter((item) => {
                integrationNameMatch = true;

                if (integrationSearch) {
                    let misServiceNameWithLongSpaces = "[#" + item.id + "] " + item.title;
                    let misServiceNameWithoutLongSpaces = misServiceNameWithLongSpaces.replace(/\s+/g, ' ')
                    integrationNameMatch = regIntegrations.test(misServiceNameWithoutLongSpaces)
                }

                return integrationNameMatch
            })
        },
    },
}

</script>

<style scoped>
    .sync {
        background-color: #d1e7dd;
    }

    .width-100 {
        width: 100%;
        padding-left: 0 !important;
    }

    .width-30 {
        width: 30%;
    }

    .width-18 {
        width: 18%;
        padding: 0 !important;
        text-align: center;
    }

    .width-7 {
        width: 7%;
        text-align: center;
    }

    .cursor-pointer {
        cursor: pointer;
    }

    .service-picker {
        width: 250px;
    }

    .hoverable:hover {
        background-color: rgba(0,0,0,.05);
    }

    .table-danger {
        background-color: #f8d7da;
    }

    .textarea {
        font-size: 12px !important;
        padding-top: 0 !important;
        margin-top: 0 !important;
    }

    .subtable tr:nth-of-type(odd) {
        background-color: rgba(0, 0, 0, .05);
    }
    .max-width-100 {
        max-width: 100px;
    }

    .input-search {
        width: 350px;
    }
</style>
