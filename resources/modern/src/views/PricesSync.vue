<template>
  <v-app>
    <div v-if="error.show">
      <v-alert :type="error.type">
        {{ error.message }}
      </v-alert>
    </div>

    <v-main v-else>
      <v-container fluid class="v-container-fluid">
        <Header :need-synchronize="needSynchronize"
                :integration-id="integrationId"
                :mis-clinic-id="misClinicId"
                :clinic="clinic"
                :filial="filial"
                :mis-services="misServices"
                :our-services="ourServices"
                :mis-clinic-ids-for-copy-prices="misClinicIdsForCopyPrices"
                :loading="isDataLoading || saveLoading"
                :prices-sync="pricesSync"
                :is-auto-saving="isAutoSaving"
                :users-count="usersCount"
                :outdate-value="outdateValue"
                :show-smart-results-button="showSmartResultsButton"
                @sync-changed="switchSync"
                @exclude-not-connected="excludeNotConnected"
                @exclude-lower-than="excludeLowerThan"
                @open-import-file-dialog="setImportFileDialogVisibility(true)"
                @open-import-duplicates-dialog="setImportDuplicatesDialogVisibility(true)"
                @open-import-worktimes-dialog="setWorktimesDialogVisibility(true)"
                @open-backup-file-dialog="setBackupFileDialogVisibility(true)"
                @open-comment-dialog="setCommentDialogVisible(true)"
                @open-smart-matching-results-dialog="setSmartDialogVisible(true)"
                @open-combined-price-dialog="openCombinedPriceDialog"
                @open-creating-price-dialog="openCreatingPriceDialog"
                @open-copy-price-dialog="openCopyPriceDialog"
                @open-reset-price-dialog="resetPricesModalVisible = true"
                @smart-matching-services="smartMatchingServices"
                @smart-matching-receptions="smartMatchingReceptions"
                @change-is-auto-save-flag="changeIsAutoSaveFlag"
                @clear-is-updating-field="clearIsUpdatingField"
                @transfer-prices="transferPrices"
                @delete-all-outdated-prices="deleteAllOutdatedPrices"
                @save-clicked="saveAll"
                @open-outdate-value-dialog="setOutdateValueDialogVisible(true)"
                @get-outdate-value="getOutdateValue"
                @update-price-ids="updatePriceIds"
        />

        <ServicesTable v-model="misServices"
                       v-if="dataReady"
                       :integration-id="integrationId"
                       :mis-clinic-id="misClinicId"
                       :our-services="ourServices"
                       :only-duplicates="onlyDuplicates"
                       :only-combined="onlyCombined"
                       :only-not-connected="onlyNotConnected"
                       :only-old-prices="onlyOldPrices"
                       :only-repeating-prices="onlyRepeatingPrices"
                       :repeating-connected-services-id ="repeatingConnectedServicesId"
                       :only-created-by-user="onlyCreatedByUser"
                       :only-with-child-analogue="onlyWithChildAnalogue"
                       :only-with-comment-for-content="onlyWithCommentForContent"
                       :only-temporary="onlyTemporary"
                       :only-bookmarks="onlyBookmarks"
                       :show-connected="showConnected"
                       :show-excluded="showExcluded"
                       :show-combined="showCombined"
                       :show-not-connected="showNotConnected"
                       :excluded-types="excludedTypes"
                       :loading="isDataLoading"
                       :adult-services="adultServices"
                       :children-services="childrenServices"
                       :workplaces="workplaces"
                       @only-duplicates-changed="switchOnlyDuplicates"
                       @only-combined-changed="switchOnlyCombined"
                       @only-not-connected-changed="switchOnlyNotConnected"
                       @only-old-prices-changed="switchOnlyOldPrices"
                       @only-repeating-prices-changed="switchOnlyRepeatingPrices"
                       @only-created-by-user-changed="switchCreatedByUser"
                       @only-with-child-analogue-changed="switchOnlyWithChildAnalogue"
                       @only-with-comment-for-content-changed="switchOnlyWithCommentForContent"
                       @only-temporary-changed="switchOnlyTemporaryChanged"
                       @only-bookmarks-changed="switchOnlyBookmarks"
                       @show-connected-changed="switchConnectedFlag"
                       @show-not-connected-changed="switchNotConnectedFlag"
                       @show-excluded-changed="switchExcludedFlag"
                       @show-combined-changed="switchCombinedFlag"
                       @show-mis-changed="switchMisFlag"
                       @show-file-changed="switchFileFlag"
                       @exclude-this="excludeThis"
                       @return-from-exclude="returnFromExclude"
                       @duplicate-clicked="duplicateItem"
                       @add-children-service="addChildrenService"
                       @delete-clicked="deleteItem"
                       @delete-clicked-many="deleteItemMany"
                       @open-combined-price-dialog="openCombinedPriceDialog"
                       @save-clicked="saveAll"
                       @clear-filter="clearFilter"
                       @reset-filter="resetFilter"
                       @reload-mis-data="needReloadMisData = true"
        />
      </v-container>

      <v-dialog v-model="importFileDialogVisible"
                max-width="600"
                class="import-file-dialog">
        <div class="dialog-closer">
          <span @click="setImportFileDialogVisibility(false)">
            ✖
          </span>
        </div>
        <PricesInput :mis-services="misServices"
                     :integration-id="integrationId"
                     :mis-clinic-id="misClinicId"/>
      </v-dialog>

      <v-dialog v-model="importDuplicatesDialogVisible"
                max-width="600">
        <div class="dialog-closer">
          <span @click="setImportDuplicatesDialogVisibility(false)">
            ✖
          </span>
        </div>
        <DuplicatePricesInput :mis-services="misServices"
                     :integration-id="integrationId"
                     :mis-clinic-id="misClinicId"/>
      </v-dialog>

      <v-dialog v-model="importWorkTimesDialogVisible"
                max-width="600"
                class="import-file-dialog">
        <div class="dialog-closer">
          <span @click="setWorktimesDialogVisibility(false)">
            ✖
          </span>
        </div>
        <WorkTimesInput :mis-services="misServices"
                     :integration-id="integrationId"
                     :mis-clinic-id="misClinicId"/>
      </v-dialog>

      <v-dialog v-model="backupFileDialogVisible"
                max-width="600"
                class="import-file-dialog">
        <div class="dialog-closer">
          <span @click="setBackupFileDialogVisibility(false)">
            ✖
          </span>
        </div>
        <PricesInputBackup :mis-services="misServices"
                     :integration-id="integrationId"
                     :backup-files-list="backupFilesList"
                     :mis-clinic-id="misClinicId"/>
      </v-dialog>


      <v-dialog v-model="commentDialogVisible"
                max-width="500"
                @keydown.esc="commentDialogVisible = false"
      >
        <CommentForPriceSync
            :prices-sync="pricesSync"
            :integration-id="integrationId"
            :mis-clinic-id="misClinicId"
            @close="commentDialogVisible = false"
        />
      </v-dialog>

      <v-dialog v-model="smartMatchDialogVisible"
                max-width="500"
                @keydown.esc="smartMatchDialogVisible = false"
      >
        <SmartMatchResults
          :smart-match-results="smartMatchResults"
          @close="smartMatchDialogVisible = false"
        />
      </v-dialog>

      <v-dialog v-model="outdateValueDialogVisibile"
                max-width="500"
                @keydown.esc="outdateValueDialogVisibile = false"
      >
        <div>
        <v-card>
          <v-card-title>
            Дней для устаревания цены
          </v-card-title>

          <v-card-text>
            <v-textarea
                rows="1"
                auto-grow
                class="sr-only"
                v-model="newOutdatedValue"
            />
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="white--text text-right ml-2"
                   color="teal darken-2"
                   text
                   @click="setOutdateValue"
            >
              Сохранить
            </v-btn>
          </v-card-actions>

        </v-card>
        </div>
      </v-dialog>

      <v-dialog v-model="combinedPriceModalVisible"
                max-width="600"
                @keydown.esc="closeCombinedPriceDialog"
                @close="closeCombinedPriceDialog"
      >
        <CombinedPriceModal v-if="combinedPriceModalVisible"
                            :mis-services="misServices"
                            :our-services="ourServices"
                            :mis-clinic-id="misClinicId"
                            :integration-id="integrationId"
                            :combined-price-id="combinedPriceId"
                            :mis-service-item="misServiceItem"
                            @save-all="saveAll"
                            @reload-mis-data="needReloadMisData = true"
        ></CombinedPriceModal>
      </v-dialog>

      <v-dialog v-model="creatingPriceModalVisible"
                max-width="600"
                @keydown.esc="creatingPriceModalVisible = false"
                @close="creatingPriceModalVisible = false"
      >
        <CreatePriceModal
            v-if="creatingPriceModalVisible"
            :integration-id="integrationId"
            :mis-clinic-id="misClinicId"
            :clinic-id="clinic.id"
            :filial-id="filial.id"
            @save-all="saveAll"
            @reload-mis-data="needReloadMisData = true"
        />
      </v-dialog>

      <v-dialog v-model="copyPricesModalVisible"
                max-width="600"
                @keydown.esc="copyPricesModalVisible = false"
                @close="copyPricesModalVisible = false"
      >
        <CopyPricesModal
            v-if="copyPricesModalVisible"
            :integration-id="integrationId"
            :mis-clinic-id="misClinicId"
            :mis-clinic-ids-for-copy-prices="misClinicIdsForCopyPrices"
        />
      </v-dialog>

      <v-dialog v-model="resetPricesModalVisible"
                max-width="600"
                persistent
      >
        <ResetPricesModal
            v-if="resetPricesModalVisible"
            :integration-id="integrationId"
            :mis-clinic-id="misClinicId"
            @reload-mis-data="needReloadMisData = true"
            @close="resetPricesModalVisible = false"
        />
      </v-dialog>

      <v-dialog v-model="confirmDeleteModalVisible"
                max-width="600"
                persistent
      >
        <ServicesTableModalDeleteRow
            v-if="confirmDeleteModalVisible"
            :item="itemToDelete"
            @delete-from-services-table="getMisData"
            @close="closeConfirmDeleteDialog"
            @save-all="saveAll"
        />
      </v-dialog>

      <v-dialog v-model="confirmDeleteManyModalVisible"
        max-width="1000"
        persistent
      >
        <ServicesTableModalDeleteManyRows
            v-if="confirmDeleteManyModalVisible"
            :items="itemsToDelete"
            @delete-from-services-table="getMisData"
            @close-many="closeConfirmDeleteManyDialog"
            @save-all="saveAll"
        />
      </v-dialog>

      <v-dialog v-model="deleteAllOutdatedPricesVisible"
                max-width="600"
                persistent
      >
        <DeleteAllOutdatedPrices
            v-if="deleteAllOutdatedPricesVisible"
            :integration-id="integrationId"
            :mis-clinic-id="misClinicId"
            @get-mis-data="getMisData"
            @close="closeConfirmDeleteOutdatedPricesDialog"
        />
      </v-dialog>

      <v-dialog v-model="transferPricesVisible"
                max-width="600"
                persistent
      >
        <TransferPrices
            v-if="transferPricesVisible"
            :integration-id="integrationId"
            :mis-clinic-id="misClinicId"
            @close="closeTransferPricesDialog"
        />
      </v-dialog>

      <v-snackbar v-model="message.show">
        {{ message.text }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
import ServicesTable from '../components/PricesSync/ServicesTable';
import Header from '../components/PricesSync/Header';
import axios from 'axios'
import {
  GET_OUR_PRICES_URL,
  GET_MIS_PRICES_URL,
  SAVE_ALL_URL,
  SMART_MATCHING_SERVICES_URL,
  SMART_MATCHING_RECEPTIONS_URL,
  GET_PRICES_SYNC_URL,
  GET_SERVICES_EXCLUDED_TYPE_URL,
  GET_CHILD_SERVICES_INFO_URL,
  GET_USERS_COUNT,
  GET_NP_WORKPLACES,
  GET_SMART_RESULTS,
  POST_CLEAR_CURRENT_USER,
  GET_BACKUP_PRICES_LIST,
  SET_OUTDATE_VALUE,
  GET_OUTDATE_VALUE, UPDATE_PRICE_IDS,
} from '../../constants'
import PricesInput from "../components/PricesSync/PricesInput";
import DuplicatePricesInput from "../components/PricesSync/DuplicatePricesInput";
import WorkTimesInput from "../components/PricesSync/WorkTimesInput";
import PricesInputBackup from "../components/PricesSync/PricesInputBackup";
import CommentForPriceSync from '../components/PricesSync/CommentForPriceSync';
import SmartMatchResults from '../components/PricesSync/SmartMatchResults';
import CombinedPriceModal from '../components/PricesSync/CombinedPrices/CombinedPriceModal';
import CreatePriceModal from '../components/PricesSync/CreatePrice/CreatePriceModal';
import CopyPricesModal from '../components/PricesSync/CopyPrices/CopyPricesModal';
import ResetPricesModal from '../components/PricesSync/ResetPrices/ResetPricesModal';
import ServicesTableModalDeleteRow from '../components/PricesSync/ServicesTableModalDeleteRow';
import ServicesTableModalDeleteManyRows from '../components/PricesSync/ServicesTableModalDeleteManyRows';
import DeleteAllOutdatedPrices from '../components/PricesSync/DeleteAllOutdatedPrices';
import TransferPrices from '../components/PricesSync/TransferPrices';

const DRIVER_NOT_SUPPORTED = 1;
const DUPLICATE_PREFIX = 'duplicate_';

export default {
  name: 'PricesSync',
  created () {
    document.title = 'Сопоставление цен';
  },
  components: {
    CreatePriceModal,
    CommentForPriceSync,
    SmartMatchResults,
    PricesInput,
    DuplicatePricesInput,
    WorkTimesInput,
    PricesInputBackup,
    ServicesTable,
    Header,
    CombinedPriceModal,
    CopyPricesModal,
    ResetPricesModal,
    ServicesTableModalDeleteRow,
    ServicesTableModalDeleteManyRows,
    DeleteAllOutdatedPrices,
    TransferPrices,
  },

  data: () => ({
    outdateValue: 1,
    dataReady: false,
    backupFilesList: [],
    misPrices: [],
    misServices: [],
    ourServices: [],
    needSynchronize: false,
    integrationId: 0,
    misClinicId: '',
    misClinicIdsForCopyPrices: [],
    workplaces: [],
    pricesSync: {},
    excludedTypes: [],
    smartMatchResults: {},

    clinic: {
      id: 0,
      title: '',
      city: '',
    },

    filial: {
      id: 0,
      title: '',
      city: '',
    },

    itemToDelete: {},
    itemsToDelete: [],
    childrenServices: [],
    adultServices: [],
    childrenForServicesTable: [],

    duplicateCounter: 0,
    misDataLoading: false,
    ourDataLoading: false,
    saveLoading: false,

    onlyDuplicates: false,
    onlyCombined: false,
    onlyNotConnected: false,
    onlyOldPrices: false,
    onlyRepeatingPrices: false,
    onlyCreatedByUser: false,
    onlyWithChildAnalogue: false,
    onlyWithCommentForContent: false,
    onlyTemporary: false,
    onlyBookmarks: false,
    showConnected: true,
    showNotConnected: true,
    showExcluded: true,
    showCombined: true,
    showMIs: true,
    showFile: true,
    commentDialogVisible: false,
    smartMatchDialogVisible: false,
    outdateValueDialogVisibile: false,
    importFileDialogVisible: false,
    importDuplicatesDialogVisible: false,
    importWorkTimesDialogVisible: false,
    backupFileDialogVisible: false,
    combinedPriceModalVisible: false,
    creatingPriceModalVisible: false,
    copyPricesModalVisible: false,
    confirmDeleteModalVisible: false,
    confirmDeleteManyModalVisible: false,
    deleteAllOutdatedPricesVisible: false,
    transferPricesVisible: false,
    resetPricesModalVisible: false,
    isAutoSaving: false,
    timerId: 0,
    repeatingConnectedServicesId: [],
    showSmartResultsButton: false,

    error: {
      show: false,
      type: 'error',
      message: '',
    },

    combinedPriceId: 0,
    misServiceItem: {},
    needReloadMisData: false,
    usersCount: 0,
    newOutdatedValue: '',
  }),

  mounted() {
    this.integrationId = Number.parseInt(this.getUrlParam('integration_id')) || 0;
    this.misClinicId = this.getUrlParam('mis_clinic_id') || '';
    this.getPricesSyncData();

    let testServices = Number.parseInt(this.getUrlParam('test_services')) || 0;

    if (testServices > 0) {
      this.getTestMisData(testServices);
      this.getNpWorkplaces();
    } else {
      this.getMisData().then(() => {
        this.getNpWorkplaces();
      });
    }
    this.getExcludedType();
    this.getOurData();
    this.getChildData();
    this.autoSaving();
    this.getUsersCount();

    this.getOutdateValue();
    this.getSmartResults();

    window.addEventListener('unload', this.clearCurrentUser);
  },

  watch: {
    combinedPriceModalVisible(visible) {
      if (!visible) {
        this.reloadMisData();
      }
    },

    creatingPriceModalVisible(visible) {
      if (!visible) {
        this.reloadMisData();
      }
    },

    resetPricesModalVisible(visible) {
      if (!visible) {
        this.reloadMisData();
      }
    }
  },

  computed: {
    isDataLoading() {
      return this.misDataLoading || this.ourDataLoading;
    },
  },

  methods: {
    getSmartResults() {
      let data = {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      };
      axios.post(this.apiUrl + GET_SMART_RESULTS, data)
        .then(response => {
          if (response.data.success) {
            this.showSmartResultsButton = true;
            this.smartMatchResults = response.data;
          }
        }).catch((error) => {
        this.showMessage(error.response.data.message ?? 'Что-то пошло не так');
      })
    },

    setOutdateValue() {
      axios.post(this.apiUrl + SET_OUTDATE_VALUE, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
        value: parseInt(this.newOutdatedValue, 10) + 1
      }).then(response => {
        if (response.data.status === 1) {
          this.getOutdateValue();
          this.outdateValueDialogVisibile = false;
        } else {
          this.showMessage('При обновлении значения произошла ошибка!')
        }
      }).catch(error => {
        this.showMessage(error);
      });
    },

    getOutdateValue() {
      axios.post(this.apiUrl + GET_OUTDATE_VALUE, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then(response => {
        // минус один потому что в базе хранится значение + 1
        this.outdateValue = response.data.outdateValue - 1;
      }).catch(error => {
        this.showMessage(error);
      });
    },

    getDisplayName({id, name, specialities}) {
      return `${name} — (${specialities}) [${id}]`;
    },

    getUsersCount() {
      let generatedUserId = sessionStorage.getItem('generatedUserId');

      if (!generatedUserId) {
        generatedUserId = Math.random().toString(36).substring(2);
        sessionStorage.setItem('generatedUserId', generatedUserId)
      }

      axios.post(this.apiUrl + GET_USERS_COUNT, {
        integration_id: String(this.integrationId),
        mis_clinic_id: this.misClinicId,
        generated_user_id: generatedUserId
      }).then((response) => {
        const count = response.data.users_count;

        this.usersCount = Number(count);
      }).catch((error) => {
        console.log(error);
      });
    },

    clearCurrentUser() {
      let formData = new FormData();
      let generatedUserId = sessionStorage.getItem('generatedUserId');

      formData.append('integration_id', this.integrationId);
      formData.append('mis_clinic_id', this.misClinicId);
      formData.append('generated_user_id', generatedUserId);

      navigator.sendBeacon(this.apiUrl + POST_CLEAR_CURRENT_USER, formData);
    },

    getExcludedType() {
      axios.post(this.apiUrl + GET_SERVICES_EXCLUDED_TYPE_URL, {
      }).then(response => {
        this.excludedTypes = response.data.service_excluded_types;
      }).catch(error => {
        this.showMessage(error);
      });
    },

    getOurData() {
      this.ourDataLoading = true;

      axios.post(this.apiUrl + GET_OUR_PRICES_URL, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then(response => {
        if (response.data.code === DRIVER_NOT_SUPPORTED) {
          this.error.message = response.data.text;
          this.error.show    = true;

          return;
        }

        this.ourServices  = response.data.services;

        this.clinic.id    = response.data.clinicId;
        this.clinic.title = response.data.clinicTitle;

        this.filial.id    = response.data.filialId;
        this.filial.title = response.data.filialTitle;
        this.clinic.city  = response.data.clinicCity;
        this.filial.city  = response.data.filialCity;

      }).finally(() => {
        this.ourDataLoading = false;
      });
    },

    getNpWorkplaces() {
      axios.post(this.apiUrl + GET_NP_WORKPLACES, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then(response => {
        this.workplaces = Object.values((response.data.workplaces));

        this.workplaces.map((workplace, index) => {
          this.workplaces[index].display_name = this.getDisplayName(workplace);
        });

        this.dataReady = true;
      })
    },

    getMisData() {
      this.misDataLoading = true;

      return axios.post(this.apiUrl + GET_MIS_PRICES_URL, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then(response => {
        if (response.data.code === DRIVER_NOT_SUPPORTED) {
          this.error.message = response.data.text;
          this.error.show = true;

          return;
        }

        this.misServices = this.preparePrices(response.data.prices);
      }).finally(() => {
        this.misDataLoading = false;
      })
    },

    preparePrices(items) {
      items.forEach(item => {
        item.selected = false;
      });
      return items;
    },

    getPricesSyncData() {
      axios.post(this.apiUrl + GET_PRICES_SYNC_URL, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then(response => {
        let data = response.data;

        if (data.prices_sync_info) {
          this.pricesSync.id = data.prices_sync_info.id;
          this.pricesSync.comment = data.prices_sync_info.comment;

          this.needSynchronize = Boolean(data.prices_sync_info.sync);
        } else {
          this.pricesSync = {};
        }

        if (data.mis_clinic_ids.length) {
          this.misClinicIdsForCopyPrices = data.mis_clinic_ids;
        }
      }).catch(error => {
        this.showMessage(error);
      });
    },

    getTestMisData(n) {
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
      }

      for (let i = 0; i < n; i++) {
        this.misServices.push({
          id: i,
          mis_service_id: i*2,
          mis_service_name: Math.random().toString(36).substring(10),
          service_id: i*3,
          service_name: Math.random().toString(36).substring(10),
          price: getRandomInt(1000, 10000),
          excluded: Boolean(Math.random()),
          is_combined: Boolean(Math.random()),
          is_min_price: Boolean(Math.random()),
          excluded_service_ids: [],
          category_ids: [],
          comment: Math.random().toString(36).substring(10),
          discount: getRandomInt(1, 100),
        });
      }
    },

    saveAll() {
      this.saveLoading = true;

      let misServices = JSON.parse(JSON.stringify(this.misServices));

      misServices.map((service, serviceIndex) => {
        service.np_workplaces.map((workplace, workplaceIndex) => {
          if (typeof workplace == 'object') {
            misServices[serviceIndex].np_workplaces[workplaceIndex] = workplace.id;
          }
        });
      });

      let data = {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
        clinic_id: this.clinic.id,
        filial_id: this.filial.id || '',
        need_synchronize: this.needSynchronize,
        connected_services: misServices,
      };

      axios.post(this.apiUrl + SAVE_ALL_URL, data).then(response => {
        const responseData = response.data;
        const insertedDuplicates = responseData.data.insertedDuplicates;

        if (Object.keys(insertedDuplicates).length) {
          Object.keys(insertedDuplicates).map((duplicateTempKey) => {
            let duplicateRealId = insertedDuplicates[duplicateTempKey];
            let misServiceIndex = this.misServices.findIndex(misService => misService.id === duplicateTempKey);

            if (misServiceIndex !== -1) {
              this.misServices[misServiceIndex].id = duplicateRealId;
              this.misServices[misServiceIndex].is_new_duplicate = undefined;
            }
          });
        }

        this.showMessage(response.data.message);
      }).catch(error => {
        this.showMessage(error);
      }).finally(() => {
        this.saveLoading = false;
      });
    },

    modFilter(reset) {
      this.onlyReceptions            = false;
      this.onlyDuplicates            = false;
      this.onlyCombined              = false;
      this.onlyNotConnected          = false;
      this.onlyOldPrices             = false;
      this.onlyRepeatingPrices       = false;
      this.onlyCreatedByUser         = false;
      this.onlyWithChildAnalogue     = false;
      this.onlyWithCommentForContent = false;
      this.onlyTemporary             = false;
      this.onlyBookmarks             = false;
      this.showConnected             = reset;
      this.showNotConnected          = reset;
      this.showExcluded              = reset;
      this.showCombined              = reset;
      this.showMIs                   = reset;
      this.showFile                  = reset;
    },

    resetFilter() {
      this.modFilter(true);
    },

    clearFilter() {
      this.modFilter(false);
    },

    switchSync() {
      this.needSynchronize = !this.needSynchronize;
    },

    switchOnlyDuplicates() {
      this.onlyDuplicates = !this.onlyDuplicates;
    },

    switchOnlyCombined() {
      this.onlyCombined = !this.onlyCombined;
    },

    switchOnlyNotConnected() {
      this.onlyNotConnected = !this.onlyNotConnected;
    },

    changeIsAutoSaveFlag() {
      this.isAutoSaving = !this.isAutoSaving;
      sessionStorage.setItem('autoSave', '0');
      this.autoSaving();
    },

    switchOnlyOldPrices() {
      this.onlyOldPrices = !this.onlyOldPrices;
    },

    switchOnlyRepeatingPrices() {
      this.onlyRepeatingPrices = !this.onlyRepeatingPrices;

      if (!this.onlyRepeatingPrices) {
        return;
      }

      let servicesIds = [];
      let dict = {};

      this.misServices.forEach(function (element) {
        if (element['service_id'] !== null) {
          servicesIds.push(element['service_id'])
        }
      })

      servicesIds.forEach((service_id) => {
        if (!dict[service_id]) {
          dict[service_id] = 0;
        }
        dict[service_id]++;
      });

      Object.keys(dict).forEach((service_id) => {
        if (Number(dict[service_id]) > 1) {
          this.repeatingConnectedServicesId.push(Number(service_id));
        }
      });
    },

    switchCreatedByUser() {
      this.onlyCreatedByUser = !this.onlyCreatedByUser;
    },

    switchOnlyWithChildAnalogue() {
      this.onlyWithChildAnalogue = !this.onlyWithChildAnalogue;
    },

    switchOnlyWithCommentForContent() {
      this.onlyWithCommentForContent = !this.onlyWithCommentForContent;
    },

    switchOnlyTemporaryChanged() {
      this.onlyTemporary = !this.onlyTemporary;
    },

    switchOnlyBookmarks() {
      this.onlyBookmarks = !this.onlyBookmarks;
    },

    switchConnectedFlag() {
      this.showConnected = !this.showConnected;
    },

    switchNotConnectedFlag() {
      this.showNotConnected = !this.showNotConnected;
    },

    switchExcludedFlag() {
      this.showExcluded = !this.showExcluded;
    },

    switchCombinedFlag() {
      this.showCombined = !this.showCombined;
    },

    switchMisFlag() {
      this.showMis = !this.showMis;
    },

    switchFileFlag() {
      this.showFile = !this.showFile;
    },

    excludeNotConnected() {
      this.misServices.forEach(function (service) {
        if (!service.service_id) {
          service.excluded = true;
        }
      })
    },

    excludeLowerThan(value, isInclusive) {
      this.saveLoading = true;
      this.misServices.forEach(function (service) {
        if (service.is_reception) {
          return;
        }

        if (isInclusive) {
          if (service.price <= value) {
            service.excluded = true;
          }
        } else {
          if (service.price < value) {
            service.excluded = true;
          }
        }
      });

      this.saveLoading = false;
    },

    clearIsUpdatingField() {
      this.misServices.forEach(function (service) {
        if (!service.is_updating) {
          service.is_updating = true;
        }
      })
    },

    transferPrices() {
      this.transferPricesVisible = true;
    },

    excludeThis(value) {
      if (value && value !== ' ') {
        let valueLower = String(value).toLowerCase();

        this.misServices.forEach(function (service) {
          let misServiceLower = String(service.mis_service_name).toLowerCase();

          if (misServiceLower.indexOf(valueLower) !== -1) {
            service.excluded = true;
          }
        })
      }
    },

    returnFromExclude(value) {
      if (value && value !== ' ') {
        let valueLower = String(value).toLowerCase();

        this.misServices.forEach(function (service) {
          let misServiceLower = String(service.mis_service_name).toLowerCase();

          if (misServiceLower.indexOf(valueLower) !== -1) {
            service.excluded = false;
          }
        })
      }
    },

    setImportFileDialogVisibility(visibility) {
      this.importFileDialogVisible = visibility;
    },

    setImportDuplicatesDialogVisibility(visibility) {
      this.importDuplicatesDialogVisible = visibility;
    },

    setWorktimesDialogVisibility(visibility) {
      this.importWorkTimesDialogVisible = visibility;
    },

    setBackupFileDialogVisibility(visibility) {
      if (visibility) {
        this.reloadBackupFiles();
      }

      this.backupFileDialogVisible = visibility;
    },

    setCommentDialogVisible(visibility) {
      this.commentDialogVisible = visibility;
    },

    setSmartDialogVisible(visibility) {
      this.smartMatchDialogVisible = visibility;
    },

    setOutdateValueDialogVisible(visibility) {
      this.outdateValueDialogVisibile = visibility;
    },

    reloadBackupFiles() {
      axios.post(this.apiUrl + GET_BACKUP_PRICES_LIST, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then(response => {
        this.backupFilesList = response.data.data;
      }).catch(error => {
        this.showMessage(error);
      });
    },

    smartMatchingServices() {
      this.saveLoading = true;
      let data = {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      };
      axios.post(this.apiUrl + SMART_MATCHING_SERVICES_URL, data)
          .then(response => {
            this.showMessage(response.data.message);
          }).catch((error) => {
          this.showMessage(error.response.data.message ?? 'Что-то пошло не так');
      }).finally(() => {
        this.saveLoading = false;
      });
    },

    smartMatchingReceptions() {
      this.saveLoading = true;
      let data = {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      };
      axios.post(this.apiUrl + SMART_MATCHING_RECEPTIONS_URL, data)
          .then(response => {
            this.showMessage(response.data.message);
          }).catch(() => {
          this.showMessage('Внутренняя ошибка сервера!');
      }).finally(() => {
        this.saveLoading = false;
      });
    },

    autoSaving() {
      if (sessionStorage.getItem('autoSave') === '1') {
        this.isAutoSaving = true;
        this.timerId = setInterval(this.saveAll, 300000)
      }

      if (this.isAutoSaving) {
        if (sessionStorage.getItem('autoSave') === '0') {
          sessionStorage.setItem('autoSave', '1');
          this.timerId = setInterval(this.saveAll, 300000)
        }
      } else {
        clearInterval(this.timerId);
        sessionStorage.setItem('autoSave', '0');
      }
    },

    duplicateItem(item) {
      for (let i = 0; i < this.misServices.length; i++) {
        if (this.misServices[i].id === item.id) {
          item.original_price_id = item.id;
          item.id = DUPLICATE_PREFIX + this.duplicateCounter++;
          item.duplicate = true;
          item.is_new_duplicate = true;

          if (!item.is_combined) {
            item.service_id = '';
            item.service_name = '';
          }

          // TODO: убрать функцию this.clearItem(item), если она перестанет быть нужной
          // this.clearItem(item);
          this.misServices.splice(i + 1, 0, item);

          break;
        }
      }
    },

    updatePriceIds() {
      axios.post(this.apiUrl + UPDATE_PRICE_IDS, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then(response => {
        this.showMessage(response.data.message);
      }).catch(error => {
        this.showMessage(error);
      })
    },

    addChildrenService(item) {
      for (let i = 0; i < this.misServices.length; i++) {
        if (this.misServices[i].id === item.id) {
          item.original_price_id = item.id;
          item.id = DUPLICATE_PREFIX + this.duplicateCounter++;
          item.duplicate = true;
          item.is_new_duplicate = true;

          this.childrenServices.forEach((element) => {
            if (item.service_id === element.adult_service_id) {
              item.service_id = element.children_service_id
            }
          })

          this.ourServices.forEach((element) => {
            if (item.service_id === element.id) {
              item.service_name = element.name
            }
          })

          let ourService = this.ourServices.find((service) => {
            return service.id === item.service_id;
          });

          item.categories = ourService?.categories || [];
          this.misServices.splice(i + 1, 0, item);

          break;
        }
      }
    },

    getChildData() {
      this.ourDataLoading = true;

      axios.post(this.apiUrl + GET_CHILD_SERVICES_INFO_URL)
          .then(response => {
            this.childrenServices = response.data.child_services;
            this.childrenServices.forEach((element) => {
              this.adultServices.push(element.adult_service_id)
            })
          }).finally(() => {
        this.ourDataLoading = false;
      });
    },

    deleteItem(item) {
      if (this.isNewDuplicate(item)) {
        this.deleteMisServiceById(item);

        return true;
      }

      this.itemToDelete = item;
      this.confirmDeleteModalVisible = true;
    },

    deleteItemMany(items) {
      items.forEach((item) => {
        if (this.isNewDuplicate(item)) {
          this.deleteMisServiceById(item);

          return true;
        }
      })

      this.itemsToDelete = items;
      this.confirmDeleteManyModalVisible = true;
    },

    deleteAllOutdatedPrices() {
      this.deleteAllOutdatedPricesVisible = true;
    },

    /**
     * Цена является только что созданным дублем и еще не сохранена в БД
     *
     * @param item
     *
     * @return {boolean}
     */
    isNewDuplicate(item) {
      return !!item.is_new_duplicate;
    },

    deleteMisServiceById(item) {
      for (let i = 0; i < this.misServices.length; i++) {
        if (this.misServices[i].id === item.id) {
          this.misServices.splice(i, 1);
          this.duplicateCounter--;

          break;
        }
      }
    },

    clearItem(item) {
      item.service_id = '';
      item.service_name = '';
      item.excluded_service_ids = [];
      item.categories = [];
      item.excluded = false;
      item.is_min_price = false;
      item.comment = '';
    },

    openCombinedPriceDialog(id = 0, item = {}) {
      this.misServiceItem = item;
      this.combinedPriceId = id;
      this.combinedPriceModalVisible = true;
    },

    openCreatingPriceDialog() {
      this.creatingPriceModalVisible = true;
    },

    openCopyPriceDialog() {
      this.copyPricesModalVisible = true;
    },

    closeCombinedPriceDialog() {
      this.combinedPriceId = 0;
      this.misServiceItem = {};
      this.combinedPriceModalVisible = false;
    },

    closeConfirmDeleteDialog() {
      this.itemToDelete = {};
      this.confirmDeleteModalVisible = false;
    },

    closeConfirmDeleteManyDialog() {
      this.itemsToDelete = [];
      this.confirmDeleteManyModalVisible = false;
    },

    closeConfirmDeleteOutdatedPricesDialog() {
      this.deleteAllOutdatedPricesVisible = false;
    },

    closeTransferPricesDialog() {
      this.transferPricesVisible = false;
    },

    reloadMisData() {
      if (this.needReloadMisData) {
        this.needReloadMisData = false;
        this.getMisData();
      }
    },
  },
};
</script>

<style scoped>
.loader-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader,
.loader:after {
  border-radius: 50%;
  width: 10em;
  height: 10em;
}

.loader {
  margin: 60px auto;
  font-size: 10px;
  position: relative;
  text-indent: -9999em;
  border-top: 1.1em solid rgba(0, 0, 0, 0.2);
  border-right: 1.1em solid rgba(0, 0, 0, 0.2);
  border-bottom: 1.1em solid rgba(0, 0, 0, 0.2);
  border-left: 1.1em solid #ffffff;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation: load8 1.1s infinite linear;
  animation: load8 1.1s infinite linear;
}

@-webkit-keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.v-container-fluid {
  padding: 0 10px;
}

.v-dialog {
  position: relative;
}

.dialog-closer {
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;
  padding-top: 5px;
  position: absolute;
  font-size: 1.3rem;
  color: #999999;
  right: 0;
}

.dialog-closer span {
  cursor: pointer;
}
</style>
