<template>
  <div>
    <div>
      <h5 v-if="UrlStatus !== 'inactive'">Клиник с автоматической синхронизацией: {{ clinicCount }} (напрямую: {{ directlyClinicCount }})</h5>
      <h5 v-if="UrlStatus !== 'inactive'">Филиалов с автоматической синхронизацией: {{ filialCount }} (напрямую: {{ directlyFilialCount }})</h5>
      <h4 v-else>Список неактивных синхронизаций цен</h4>
    </div>

    <v-btn
      v-if="expandAll === false"
      color="teal"
      small
      dark
      class="mb-2 mr-2"
      @click="expandAllFilials()"
    >
      Развернуть все филиалы
    </v-btn>
    <v-btn
      v-else
      color="teal"
      small
      dark
      class="mb-2 mr-2"
      @click="contractAllFilials2()"
    >
      Свернуть все филиалы
    </v-btn>

    <v-data-table fixed-header
      :headers="headers"
      :items="integrations"
      :items-per-page="300"
      :footer-props="footerProps"
      :page="currentPage"
      :sort-by.sync="sortField"
      :sort-desc.sync="sortIsDesc"
      class="elevation-1 pt-2"
    >
      <template v-slot:item="{ item }">

        <tr>
          <td v-if="item.stataInfo.length === 1" class="width-30 pl-2 pt-2"
              :class="{
                'table-danger': !item.isWork
                }">
            <a class="text-decoration-none text-primary" title="Cсылка на интерфейс сопоставления цен"
               :href="'https://api.napopravku.ru/modern/private/prices-sync?integration_id='+item.id+'&mis_clinic_id='+ item.stataInfo[0].id" target="_blank">
              [#{{ item.id }}]
              {{ item.integrationTitle }}
            </a>

            <v-btn
               icon
               title="Убрать из таблицы"
               @click="changeStatus(item)"
            >
              <v-icon
              small
              color="yellow darken-3"
              >
                mdi-beaker-remove-outline
              </v-icon>
            </v-btn>

            <v-textarea class="textarea"
                        :class="{ 'font-weight-bold': item.commentPriceSyncTable }"
                        v-model="item.commentPriceSyncTable"
                        placeholder="комментарий к интеграции"
                        aria-expanded="true"
                        rows="2"
                        @change="saveComment(item)"
            />
          </td>

          <td v-else class="width-30 pl-2 pt-2"
              :class="{
                'table-danger': !item.isWork
                }">
            [#{{ item.id }}]
            {{ item.integrationTitle }}

            <v-btn
                icon
                color="primary"
                title="Убрать из таблицы"
                @click="changeStatus(item)"
            >
              <v-icon
              small
              color="yellow darken-3"
              >
                mdi-beaker-remove-outline
              </v-icon>
            </v-btn>

            <v-textarea class="textarea"
                        :class="{ 'font-weight-bold': item.commentPriceSyncTable }"
              v-model="item.commentPriceSyncTable"
              placeholder="комментарий к интеграции"
              aria-expanded="true"
              rows="2"
              @change="saveComment(item)"
            />
          </td>

          <td class="pl-0 pr-0 max-width-118">
            {{ item.driver }}
          </td>

          <td v-if="item.stataInfo.length > 1 && item.showFilials === false" colspan="9" class="pr-0 pl-0 pb-3 pt-0">
            <table class="width-118">
              <tbody class="subtable">
              <tr class="">
                <td class="width-18 text-left">
                  <v-btn
                    color="white"
                    @click="expandFilials(item)"
                    small
                    block
                    class="pl-0 pr-0"
                  >
                    <v-icon dark>
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </td>

                <td :class="{'sync': item.isSync !== 'no sync'}" class="width-7">
                  <span v-if="item.isSync === 'from file'">
                    Да, из файла
                  </span>
                      <span v-else-if="item.isSync === 'directly'">
                    Да, напрямую
                  </span>
                      <span v-else>
                    Нет
                  </span>
                </td>
                <td class="width-7">...</td>
                <td class="width-7">...</td>
                <td class="width-7">...</td>
                <td class="width-7">...</td>
                <td class="width-7">...</td>
                <td class="width-7">...</td>
                <td class="width-7">{{ item.syncDate }}</td>
              </tr>
              </tbody>
            </table>
          </td>
          <td v-else-if="item.stataInfo.length > 1 && item.showFilials === true" colspan="9" class="pr-0 pl-0 pb-3 pt-0">
            <table class="width-118">
              <tbody class="subtable">
              <tr>
                <td colspan="9" class="pr-0 pl-0 pb-1 pt-0">
                  <v-btn
                    color="white"
                    @click="contractFilials(item)"
                    small
                    block
                    class="pl-0 pr-0"
                  >
                    <v-icon dark>
                      mdi-minus
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr v-for="element in item.stataInfo" :key="item.id + '_' + element.id" class="">
                <td class="width-18 text-left">
                  <a class="text-decoration-none text-primary" title="Cсылка на интерфейс сопоставления цен"
                     :href="'https://api.napopravku.ru/modern/private/prices-sync?integration_id='+item.id+'&mis_clinic_id='+ element.id" target="_blank">
               <span v-if="element['title']">
                 {{ element['title'] }}
               </span>
                    <span v-else>
                 --
               </span>
                  </a>
                </td>

                <td v-if="element['filial_id']" class="width-7">
                  <a @click="doCopy(element)">
                    {{ element['filial_id'] }}
                  </a>
                </td>

                <td v-else class="width-7">
                  <a @click="doCopy(element)">
                    {{ element['clinic_id'] }}
                  </a>
                </td>

                <td :class="{
              'sync': element.isSync !== 'no sync',
              }" class="width-7">
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
                  {{ element['serviceType'] }}
                </td>

                <td class="width-7">{{ element['prices']['total'] }}</td>
                <td class="width-7">{{ element['prices']['matched'] }}</td>
                <td class="width-7">{{ element['prices']['new'] }}</td>
                <td class="width-7">{{ element['prices']['temporary'] }}</td>
                <td class="width-7"
                    :class="{
              'table-danger': element['prices']['lost'] && element.isSync !== 'no sync'
              }">
                  {{ element['prices']['lost'] }}
                </td>
                <td class="width-7">{{ element['prices']['created_by_user'] }}</td>

                <td v-if="element['syncDate'] && element.isSync !== 'no sync'" class="width-7">
                  {{ element['syncDate'] }}
                </td>

                <td v-else class="width-7">
                  -
                </td>

              </tr>
              </tbody>
            </table>
          </td>

          <td v-else colspan="9" class="pr-0 pl-0 pb-3 pt-0">
            <table class="width-118">
              <tbody class="subtable">
              <tr class="">
                <td class="width-18 text-left">

                </td>

                <td v-if="item.stataInfo[0]['filial_id']" class="width-7">
                  <a @click="doCopy(item.stataInfo[0])">
                    {{ item.stataInfo[0]['filial_id'] }}
                  </a>
                </td>

                <td v-else class="width-7">
                  <a @click="doCopy(item.stataInfo[0])">
                    {{ item.stataInfo[0]['clinic_id'] }}
                  </a>
                </td>

                <td v-if="item.stataInfo.length < 2" :class="{'sync': item.isSync !== 'no sync'}" class="width-7">
                  <span v-if="item.isSync === 'from file'">
                    Да, из файла
                  </span>
                  <span v-else-if="item.isSync === 'directly'">
                    Да, напрямую
                  </span>
                  <span v-else>
                    Нет
                  </span>
                </td>
                <td v-if="item.stataInfo.length === 1" class="width-7">
                  {{ item.stataInfo[0]['serviceType'] }}
                </td>
                <td v-if="item.stataInfo.length === 1" class="width-7">
                  {{ item.stataInfo[0]['prices']['total'] }}
                </td>
                <td v-if="item.stataInfo.length === 1" class="width-7">
                  {{ item.stataInfo[0]['prices']['matched'] }}
                </td>
                <td v-if="item.stataInfo.length === 1" class="width-7">
                  {{ item.stataInfo[0]['prices']['new'] }}
                </td>
                <td v-if="item.stataInfo.length === 1" class="width-7">
                  {{ item.stataInfo[0]['prices']['temporary'] }}
                </td>
                <td v-if="item.stataInfo.length === 1" class="width-7"
                    :class="{
                'table-danger': item.stataInfo[0]['prices']['lost'] && item.isSync !== 'no sync'
                }">
                  {{ item.stataInfo[0]['prices']['lost'] }}
                </td>
                <td v-if="item.stataInfo.length === 1" class="width-7">
                  {{ item.stataInfo[0]['prices']['created_by_user'] }}
                </td>
                <td v-if="item.stataInfo.length === 1 && item.isSync !== 'no sync'" class="width-7">
                  {{ item.stataInfo[0]['syncDate'] }}
                </td>

                <td v-else-if="item.stataInfo.length === 1" class="width-7">
                  -
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-snackbar
      v-model="messageSnack.show"
      elevation="0"
      color="success"
      tile
    >
      {{ messageSnack.text }}
    </v-snackbar>
  </div>
</template>

<script>
import {
    POST_RESET_ALL_PRICES

} from '../../../constants'
  import axios from "axios";
  export default {
    name: "IntegrationsTable",

    props: {
      integrations: {
        type: Array,
        default: () => [],
      },

      clinicCount: {
        type: Number,
        default: 0,
      },

      directlyClinicCount: {
        type: Number,
        default: 0,
      },

      filialCount: {
        type: Number,
        default: 0,
      },

      directlyFilialCount: {
        type: Number,
        default: 0,
      },

      UrlStatus: {
        type: String,
        default: ''
      }
    },

    data: () => ({
      sortField: 'isSync',
      sortIsDesc: false,

      messageSnack: {
        show: false,
        text: '',
      },

      headers: [
        {text: 'Интеграция', value: 'id', align: 'center', width: '30%'},
        {text: 'МИС', value: 'driver', align: 'center', width: '80'},
        {text: 'Филиал', value: '', align: 'center', width: '13%'},
        {text: 'id', value: '', align: 'center', width: '5%'},
        {text: 'Синхронизация?', value: 'isSync', align: 'center', width: '5%'},
        {text: 'Услуги/ приемы', value: 'serviceType', align: 'center', width: '5%'},
        {text: 'Всего', value: 'stataInfo[0].prices.total', align: 'right', width: '5%'},
        {text: 'Сопоставлено', value: 'matched', align: 'right', width: '5%'},
        {text: 'Новых', value: 'new', align: 'center', width: '5%'},
        {text: 'Временных', value: 'temporary', align: 'center', width: '5%'},
        {text: 'Перестали приходить', value: 'lost', align: 'left', width: '5%'},
        {text: 'Ручных', value: "", align: 'center', width: '5%'},
        {text: 'Дата синхрона', value: 'syncDate', align: 'center', width: '5%'},
      ],

      currentPage: 1,
      beforeSearchPage: 1,

      footerProps: {
        'items-per-page-options': [50, 100, 150, 200, 300, -1],
        'items-per-page-text': 'Строк на странице:',
        'page-text': '{0}-{1} из {2}',
      },

      expandAll: false,
    }),

    methods: {
      doCopy: function (el) {
        let id = '';

        if (el.filial_id) {
          id = String(el.filial_id);
        } else {
          id = String(el.clinic_id);
        }

        this.showMessage('Скопировано: ' + id);
        this.$copyText(id);
      },

      showMessage(text) {
        this.messageSnack.text = text;
        this.messageSnack.show = true;
      },

      saveComment(item) {
        this.$emit('save-comment', item);
      },

      changeStatus(item) {
        item.isActive = !item.isActive;
        this.$emit('change-status', item);
      },

      expandFilials(item) {
        item.showFilials = true;
      },

      contractFilials(item) {
        item.showFilials = false;
      },

      expandAllFilials() {
        this.integrations.forEach((el) => {
          el.showFilials = true;
        });
        this.expandAll = true;
      },

        contractAllFilials2() {
        console.log( this.apiUrl +'/testroute');
        axios.post(this.apiUrl + '/api' +'/testroute', {
            data_1: 'hello from front!',
        }
      ).then(() => {
                console.log('then')
            }).catch(() => {
                console.log('catch')
            }).finally(() => {
                console.log('finally')
            });
        },

      contractAllFilials() {
          console.log(this.apiUrl);
          axios.post(this.apiUrl + POST_RESET_ALL_PRICES, {
              integration_id: this.integrationId,
              mis_clinic_id: this.misClinicId
          }).then(() => {
              this.$emit('reload-mis-data');
              this.onClose();
          }).catch((error) => {
              this.showMessage('error', error.response.data.message ?? 'Что-то пошло не так');
          }).finally(() => {
              this.loading = false;
          });
      },
    }
  }
</script>

<style scoped>
  td {
    vertical-align: top;
    padding: 0;
  }

  .sync {
    background-color: #d1e7dd;
  }

  .width-118 {
    width: 118%;
    padding-left: 0 !important;
  }

  .width-30 {
    width: 30%;
    padding: 0 !important;
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
</style>

<style>

td {
  padding: 0;
}

th {
  padding: 0 !important;
}

.v-data-table .v-data-table__wrapper {
  overflow: unset;
}

.v-text-field__details {
  display: none !important;
}

.v-text-field__details {
  display: none !important;
}

</style>
