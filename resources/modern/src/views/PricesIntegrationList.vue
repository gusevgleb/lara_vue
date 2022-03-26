<template>
  <v-app>

    <v-main>
      <v-container fluid class="v-container-fluid">
        <IntegrationsTable
          v-model="filteredIntegrations"
          :integrations="filteredIntegrations"
          :clinic-count="clinicCount"
          :directly-clinic-count="directlyClinicCount"
          :directly-filial-count="directlyFilialCount"
          :filial-count="filialCount"
          :url-status="this.status"
          @save-comment="saveComment"
          @change-status="changeStatus"
        />
      </v-container>

      <v-snackbar v-model="message.show">
        {{ message.text }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
import IntegrationsTable from '../components/PricesIntegrationList/IntegrationsTable';

import axios from 'axios'
import {
  GET_LIST_URL,
  SAVE_COMMENT_PRICE_SYNC_TABLE_URL,
  CHANGE_INTEGRATION_STATUS_URL
} from '../../constants'

export default {
  name: 'PricesSync',
  created () {
    document.title = 'Синхронизация цен';
  },
  components: {
    IntegrationsTable,
  },

  props: {
    status: {
      type: String,
      default: 'active',
    },

  },

  data: () => ({
    integrations: [],
    clinicCount: 0,
    filialCount: 0,
    directlyClinicCount: 0,
    directlyFilialCount: 0,
  }),

  mounted() {
    this.getIntegrationsData();
  },

  computed: {
    filteredIntegrations: function () {
      let needActiveStatus = this.status !== 'inactive';

      return this.integrations.filter(integration => integration.isActive === needActiveStatus);
    }
  },

  methods: {
    saveComment(item) {
      axios.post(this.apiUrl + SAVE_COMMENT_PRICE_SYNC_TABLE_URL, {
        integrationId: item.id,
        newValue: item.commentPriceSyncTable,
      }).catch((error) => {
        this.showMessage('Ошибка сохранения комментария для ' + item.integrationTitle + error);
      });

    },

    changeStatus(item) {
      axios.post(this.apiUrl + CHANGE_INTEGRATION_STATUS_URL, {
        item: item,
        status: item.isActive,
      }).then(response => {
        this.showMessage(response.data.message);
      }).catch((error) => {
        this.showMessage('Ошибка переноса для интеграции ' + item.id + ': ' + error);
      });
    },

    getIntegrationsData() {
      let clinicList = [];
      let filialList = [];
      let onlyFilialList = [];

      let directlyClinicList = [];
      let directlyFilialList = [];

      axios.post(this.apiUrl + GET_LIST_URL, {
      }).then(response => {

        response.data.integrations.forEach((element) => {
          if (element.isActive ^ this.status === 'active') {
            return;
          }

          let integrationId = element.id;
          let integrationTitle = element.title;
          let commentPriceSyncTable = element.commentPriceSyncTable;
          let isWork = element.isWork;
          let driver = element.driver;
          let isActive = element.isActive;
          let syncDate = element.syncDate;

          let filials = element.filials;

          let isSync = 'no sync';

          filials.forEach((filial) => {

            if (filial.isSync !== 'no sync') {
              filialList.push(integrationId + ": " + filial.title + "[" + filial.id + "]");
              if (filial.isSync === 'directly') {
                directlyFilialList.push(integrationId + ": " + filial.title + "[" + filial.id + "]");
              }

              isSync = filial.isSync;
              if (!filial.isFilial) {
                clinicList.push(integrationId + ": " + filial.title + "[" + filial.id + "]");
                if (filial.isSync === 'directly') {
                  directlyClinicList.push(integrationId + ": " + filial.title + "[" + filial.id + "]");
                }
              } else {
                onlyFilialList.push(integrationId + ": " + filial.title + "[" + filial.id + "]");
              }
            }
          });

          this.integrations.push({
            id: integrationId,
            integrationTitle: integrationTitle,
            commentPriceSyncTable: commentPriceSyncTable,
            isWork: isWork,
            stataInfo: filials,
            isSync: isSync,
            driver: driver,
            isActive: isActive,
            syncDate: syncDate,
            showFilials: false,
          });
          if (this.status !== 'inactive') {
            this.clinicCount = clinicList.length;
            this.filialCount = filialList.length;
            this.directlyClinicCount = directlyClinicList.length;
            this.directlyFilialCount = directlyFilialList.length;
          }
        }, this);
      });
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
