<template>
  <div>
    <v-row>
      <v-col class="d-flex align-center col-auto mr-auto">
        <h3  v-if="clinic.id">{{ clinic.title }} [{{ clinic.id }}]
          <a class="text-decoration-none text-primary" title="Cсылка на клинику в админке"
             :href="'https://admin.napopravku.ru/clinics/'+clinic.id+'/contacts/'" target="_blank">
          <v-icon
              class="pb-1"
              color="teal darken-1"
          >
            mdi-pencil-box-multiple-outline
          </v-icon>
         </a>
        </h3>
      </v-col>
    </v-row>

    <v-row class="align-center">
      <v-col v-if="filial.id">
        <h4>{{ filial.title }} [{{filial.id}}]
          <a class="text-decoration-none text-primary" title="Cсылка на клинику в админке"
             :href="'https://admin.napopravku.ru/clinics/'+filial.id+'/contacts/'" target="_blank">
            <v-icon
                class="pb-1"
                color="teal darken-1"
            >
              mdi-pencil-box-multiple-outline
            </v-icon>
          </a>
        </h4>

      </v-col>
      <v-col v-else>
        <h4 class="grey--text">Не филиал</h4>
      </v-col>
    </v-row>

    <v-row v-if="clinic.city">
      <v-col class="col-4">
        <span> {{ clinic.city }} </span>
      </v-col>
    </v-row>

    <v-row v-if="usersCount > 1">
      <v-col class="col-4">
        <span>Сейчас с этой клиникой работают {{ usersCount }} пользователя(ей)</span>
      </v-col>
    </v-row>

    <v-row v-if="filial.city">
      <v-col class="col-4">
        <span> {{ filial.city }} </span>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        Дней для устаревания цены: <span>{{ outdateValue }}</span>
        <v-icon
            class="ml-2 pb-1"
            color="teal darken-1"
            @click="openOutdateValueDialog"
        >
          mdi-lead-pencil
        </v-icon>
      </v-col>

      <v-col v-if="showSmartResultsButton">
        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <v-btn
              class="white--text text-transform-none float-right"
              color="teal darken-2"
              elevation="0"
              @click="openSmartMatchingResultsDialog"
              v-on="on"
              v-bind="attrs"
              :disabled="loading"
            >
              <span>Итоги умного сопоставления</span>
            </v-btn>
          </template>
          <span>Цифры по итогам работы умного сопоставления</span>
        </v-tooltip>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="d-flex col-auto mr-auto">
        <div class="d-flex align-center">
          Автоматическая синхронизация
          <v-switch @change="changeSyncState"
                    v-model="syncFlag"
                    class="ml-4"
                    color="teal"
                    :loading="loading"
          />
        </div>
      </v-col>

      <v-col class="d-flex col-auto mr-auto">
        <div class="d-flex align-center">
          <v-tooltip bottom>
            <template v-slot:activator="{on, attrs}">
              <v-btn
                  class="white--text text-transform-none"
                  color="red darken-2"
                  elevation="0"
                  @click="excludeLowerThan"
                  v-on="on"
                  v-bind="attrs"
                  :disabled="loading"
              >
                <span>Вычеркнуть услуги дешевле</span>
              </v-btn>
            </template>
            <span v-if="excludeLowerThanInclusive">Исключение услуг с ценой &lt;= {{ excludeLowerThanValue }}</span>
            <span v-else>Исключение услуг с ценой &lt; {{ excludeLowerThanValue }}</span>
          </v-tooltip>

          <input type="text" class="input-exclude-price-lower" v-model="excludeLowerThanValue">
          <v-simple-checkbox color="primary" v-model="excludeLowerThanInclusive" class="checkbox-exclude-price-lower"/>
          Включительно
        </div>
      </v-col>

      <v-col class="d-flex align-center col-auto">
        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <v-btn
                class="white--text text-transform-none"
                color="teal darken-2"
                elevation="0"
                @click="openCommentDialog"
                v-on="on"
                v-bind="attrs"
                :disabled="loading"
            >
              <span>Инфо</span>

              <v-icon v-if="!!pricesSync.comment"
                  right
                  color="yellow darken-1"
              >
                mdi-comment-alert
              </v-icon>
            </v-btn>
          </template>
          <span>Комментарий об интеграции</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}" >
            <v-btn
                class="white--text text-transform-none ml-2"
                color="teal darken-2"
                elevation="0"
                @click="changeAutoSaveFlag"
                v-on="on"
                v-bind="attrs"
                :loading="loading"
                :disabled="loading"
            >
              <span v-if="!isAutoSaving">Включить<br>автосохранение</span>
              <span v-else>Остановить<br>>автосохранение</span>
            </v-btn>
          </template>
          <span v-if="!isAutoSaving">Автосохранение каждые 5 минут</span>
          <span v-else> Остановить автосохранение каждые 5 минут</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <v-btn
                class="white--text text-transform-none ml-2"
                color="teal darken-2"
                elevation="0"
                @click="smartMatchingServices"
                v-on="on"
                v-bind="attrs"
                :loading="loading"
                :disabled="loading"
            >
              Сопоставить услуги
            </v-btn>
          </template>
          <span>Сопоставить часть услуг скриптом</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <v-btn
                    class="white--text text-transform-none ml-2"
                    color="teal darken-2"
                    elevation="0"
                    @click="smartMatchingReceptions"
                    v-on="on"
                    v-bind="attrs"
                    :loading="loading"
                    :disabled="loading"
            >
              Сопоставить приёмы
            </v-btn>
          </template>
          <span>Сопоставить часть приёмов скриптом</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <v-btn
                class="white--text text-transform-none ml-2"
                color="teal darken-2"
                elevation="0"
                @click="saveButton"
                v-on="on"
                v-bind="attrs"
                :loading="loading"
                :disabled="loading"
            >
              Сохранить
            </v-btn>
          </template>
          <span>Сохранить все изменения</span>
        </v-tooltip>

        <div class="ml-2">
          <v-menu
              style="z-index: 110;"
              :close-on-content-click="false"
              offset-y
          >
            <template v-slot:activator="{ attrs, on }">
              <v-btn
                  class="text-transform-none"
                  v-bind="attrs"
                  v-on="on"
                  elevation="0"
                  text
              >
                <span>Действия</span>

                <v-icon right dark>
                  mdi-menu
                </v-icon>
              </v-btn>
            </template>

            <v-card max-width="300" class="justify-center">
              <v-list>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-btn
                              class="white--text text-transform-none"
                              color="teal darken-2"
                              elevation="0"
                              @click="openImportFileDialog"
                              v-on="on"
                              v-bind="attrs"
                              :disabled="loading"
                              block
                          >
                            Импорт
                          </v-btn>
                        </template>
                        <span>Импорт цен из файла</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-btn
                            class="white--text text-transform-none"
                            color="teal darken-2"
                            elevation="0"
                            @click="openImportDuplicatesDialog"
                            v-on="on"
                            v-bind="attrs"
                            :disabled="loading"
                            block
                          >
                            Импорт дублей
                          </v-btn>
                        </template>
                        <span>Импорт только дублей!</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-btn
                              class="white--text text-transform-none"
                              color="teal darken-2"
                              elevation="0"
                              @click="openBackupFileDialog"
                              v-on="on"
                              v-bind="attrs"
                              :disabled="loading"
                              block
                          >
                            Восстановить из бекапа
                          </v-btn>
                        </template>
                        <span>Восстанавливает данные из резервной копии</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-btn
                              class="white--text text-transform-none"
                              color="red darken-2"
                              elevation="0"
                              @click="openImportWorktimesDialog"
                              v-on="on"
                              v-bind="attrs"
                              :disabled="loading"
                              block
                          >
                            Импорт времени работы
                          </v-btn>
                        </template>
                        <span>Импорт режимов работы клиник</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item v-if="misClinicIdsForCopyPrices.length">
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-btn
                              class="white--text text-transform-none"
                              color="red darken-2"
                              elevation="0"
                              @click="openCopyPriceDialog"
                              v-on="on"
                              v-bind="attrs"
                              :disabled="loading"
                              block
                          >
                            Скопировать
                          </v-btn>
                        </template>
                        <span>Скопировать цены на другой филиал</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-btn
                              class="white--text text-transform-none"
                              color="red darken-2"
                              elevation="0"
                              @click="openResetPriceDialog"
                              v-on="on"
                              v-bind="attrs"
                              :disabled="loading"
                              block
                          >
                            Сбросить цены
                          </v-btn>
                        </template>
                        <span>Откатить все изменения</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-btn
                             class="white--text text-transform-none"
                             color="red darken-2"
                             elevation="0"
                             @click="excludeNotConnected"
                             :disabled="!excludeConnectedButtonVisible || loading"
                             block
                      >
                        Вычеркнуть<br> несопоставленные
                      </v-btn>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-btn
                             class="white--text text-transform-none"
                             color="red darken-2"
                             elevation="0"
                             @click="clearIsUpdatingField"
                             :disabled="loading"
                             block
                      >
                        Убрать все<br> галочки "устарела"
                      </v-btn>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-btn
                          class="white--text text-transform-none"
                          color="red darken-2"
                          elevation="0"
                          :disabled="loading"
                          @click="transferPrices"
                          block
                      >
                        Перенести цены на <br> другую интеграцию
                      </v-btn>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-btn
                          class="white--text text-transform-none"
                          color="red darken-2"
                          elevation="0"
                          @click="deleteAllOutdatedPrices"
                          :disabled="loading"
                          block
                      >
                        Удалить все устаревшие
                      </v-btn>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-btn
                          class="white--text text-transform-none"
                          color="red darken-2"
                          elevation="0"
                          @click="updatePriceIds"
                          :disabled="loading"
                          block
                      >
                        Обновить ID цен
                      </v-btn>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-btn
                          class="white--text text-transform-none"
                          color="red darken-2"
                          elevation="0"
                          @click="pullMisPrices"
                          :disabled="loading"
                          block
                      >
                        Забрать из МИС
                      </v-btn>
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="mr-0 flex">
                    <div class="flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-btn class="white--text text-transform-none"
                                 color="red darken-2"
                                 elevation="0"
                                 @click="sendToZalivator"
                                 v-on="on"
                                 v-bind="attrs"
                                 :disabled="loading"
                                 block
                          >
                            Синхронизировать<br>сейчас
                          </v-btn>
                        </template>
                        <span>Отправляет цены в БД сайта</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </v-col>
    </v-row>

    <v-divider/>

    <v-row>
      <v-col class="d-flex col-auto mr-auto">

      </v-col>

      <v-col class="d-flex col-auto align-center">
        <v-btn
            class="white--text text-transform-none"
            color="teal darken-2"
            elevation="0"
            @click="openCreatingPriceDialog"
            :disabled="loading"
        >
          Создать цену вручную
        </v-btn>

        <v-btn
            class="white--text ml-2 text-transform-none"
            color="teal darken-2"
            elevation="0"
            @click="openCombinedPriceDialog"
            :disabled="loading"
        >
          Создать<br>комбинированную цену
        </v-btn>
      </v-col>
    </v-row>

    <v-snackbar v-model="message.show">
      {{ message.text }}
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";

const SEND_TO_ZALIVATOR_URL = 'price/v1/send_to_zalivator';
const PULL_MIS_PRICES_URL   = 'price/v1/pull_mis_prices';

export default {
  name: "Header",

  props: {
    outdateValue: {
      type: Number,
      default: 1
    },

    needSynchronize: {
      type: Boolean,
      default: true,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    integrationId: {
      type: Number,
      default: 0,
    },

    misClinicId: {
      type: String,
      default: '',
    },

    clinic: {
      type: Object,
      default: () => ({
        id: 0,
        title: '',
      }),
    },

    filial: {
      type: Object,
      default: () => ({
        id: 0,
        title: '',
        city: '',
      }),
    },

    misServices: {
      type: Array,
      default: () => [],
    },

    ourServices: {
      type: Array,
      default: () => [],
    },

    misClinicIdsForCopyPrices: {
      type: Array,
      default: () => [],
    },

    pricesSync: {
      type: Object,
      required: true,
    },

    isAutoSaving: {
      type: Boolean,
      default: false,
    },

    usersCount: {
      type: Number,
      default: 0,
    },

    showSmartResultsButton: {
      type: Boolean,
      default: false,
    }
  },

  data: () => ({
    syncFlag: false,
    excludeConnectedButtonVisible: true,
    excludeLowerThanValue: 1000,
    excludeLowerThanInclusive: true,
    importFileDialogVisible: false,
  }),

  watch: {
    needSynchronize() {
      this.syncFlag = this.needSynchronize;
    },
  },

  methods: {
    openOutdateValueDialog() {
      this.$emit('open-outdate-value-dialog');
    },

    saveButton() {
      this.$emit('save-clicked');
    },

    changeSyncState() {
      this.$emit('sync-changed');
    },

    excludeLowerThan() {
      this.$emit('exclude-lower-than', this.excludeLowerThanValue, this.excludeLowerThanInclusive);
    },

    excludeNotConnected() {
      this.excludeConnectedButtonVisible = false;
      this.$emit('exclude-not-connected');
    },

    openImportFileDialog() {
      this.$emit('open-import-file-dialog');
    },

    openImportDuplicatesDialog() {
      this.$emit('open-import-duplicates-dialog');
    },

    openImportWorktimesDialog() {
      this.$emit('open-import-worktimes-dialog');
    },

    openBackupFileDialog() {
      this.$emit('open-backup-file-dialog');
    },

    openCommentDialog() {
      this.$emit('open-comment-dialog');
    },

    openSmartMatchingResultsDialog() {
      this.$emit('open-smart-matching-results-dialog');
    },

    smartMatchingServices() {
      this.$emit('smart-matching-services');
    },

    smartMatchingReceptions() {
      this.$emit('smart-matching-receptions');
    },

    changeAutoSaveFlag() {
      this.$emit('change-is-auto-save-flag');
    },

    openCombinedPriceDialog() {
      this.$emit('open-combined-price-dialog');
    },

    openCreatingPriceDialog() {
      this.$emit('open-creating-price-dialog');
    },

    openCopyPriceDialog() {
      this.$emit('open-copy-price-dialog');
    },

    openResetPriceDialog() {
      this.$emit('open-reset-price-dialog');
    },

    sendToZalivator() {
      axios.post(this.apiUrl + SEND_TO_ZALIVATOR_URL, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then(response => {
        this.showMessage(response.data.message);
      }).catch(error => {
        this.showMessage(error);
      });
    },

    pullMisPrices() {
      axios.post(this.apiUrl + PULL_MIS_PRICES_URL, {
        integration_id: this.integrationId,
      }).then(response => {
        this.showMessage(response.data.message);
      }).catch(error => {
        this.showMessage(error);
      });
    },

    updatePriceIds() {
      this.$emit('update-price-ids');
    },

    clearIsUpdatingField() {
      this.$emit('clear-is-updating-field');
    },

    transferPrices() {
      this.$emit('transfer-prices');
    },

    deleteAllOutdatedPrices() {
      this.$emit('delete-all-outdated-prices');
    },
  }
}
</script>

<style scoped>
  .input-exclude-price-lower {
    width: 65px;
    margin: 0 10px;
    border-bottom: 1px solid black;
    padding: 0 3px;
  }

  .input-exclude-price-lower:focus, .input-exclude-price-lower:focus{
    outline: none;
  }

  .checkbox-exclude-price-lower {
    margin: 0 3px;
  }

  .text-transform-none {
    text-transform: none;
  }
</style>
