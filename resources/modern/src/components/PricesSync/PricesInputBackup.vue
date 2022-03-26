<template>
  <div class="load-file-wrapper">
    <div class="d-flex flex-column load-button-wrapper">
      <strong class="mb-2 load-button-title">Загрузка бекапа</strong>
      <v-file-input v-model="priceListFile"
                    class="white--text"
                    label="Загрузить резервную копию"
                    outlined
                    dense/>

      <div class="d-flex align-center">
        <v-btn class="white--text"
               color="teal darken-2"
               elevation="5"
               @click="savePriceList">
          Отправить
        </v-btn>
      </div>

      <div style="color: red;">
        <br>
        <br>
        <b>Внимание!</b>
        <br>
        Данное действие удалит все текущие цены и восстановит всё из файла!
      </div>
      <br>
      <br>

      <div>
        <h5>Скачать резервную копию</h5>
        <a :href="downloadBackupUrl(fileName)" v-for="fileName in backupFilesList" v-bind:key="fileName"><div>{{ fileName }}</div></a>
      </div>
    </div>

    <v-snackbar v-model="message.show">
      {{ message.text }}
    </v-snackbar>
  </div>
</template>

<script>
  import axios from 'axios'
  import {
    IMPORT_PRICE_LIST_BACKUP_URL,
    DOWNLOAD_PRICE_LIST_BACKUP_URL
  } from "../../../constants";

  export default {
    name: "PricesInputBackup",
    props: {
      misServices: {
        type: Array,
        default: () => [],
      },

      backupFilesList: {
        type: Array,
        default: () => [],
      },

      integrationId: {
        type: Number,
        default: 0,
      },

      misClinicId: {
        type: String,
        default: '',
      },
    },
    data: () => ({
      priceListFile: null,
    }),
    methods: {
      downloadBackupUrl(fileName) {
        let params = {
          integration_id: this.integrationId,
          mis_clinic_id: this.misClinicId,
          file_name: fileName,
        };

        var esc = encodeURIComponent;
        var query = Object.keys(params)
            .map(k => esc(k) + '=' + esc(params[k]))
            .join('&');

        return  this.apiUrl + DOWNLOAD_PRICE_LIST_BACKUP_URL + '?' + query;
      },

      savePriceList() {
        if (!this.priceListFile) {
          this.showMessage('Загрузите файл!');
          return;
        }

        let formData = new FormData();
        formData.append('file', this.priceListFile);
        formData.append('integration_id', this.integrationId);
        formData.append('mis_clinic_id', this.misClinicId);

        let config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        axios.post(this.apiUrl + IMPORT_PRICE_LIST_BACKUP_URL, formData, config)
          .then(response => {
            this.showMessage(response.data.message);
            if (!response.data.success === false) {
              location.reload();
            }
          })
          .catch(error => {
            this.showMessage(error);
          });
      },
    },
  }
</script>

<style scoped>
  .load-file-wrapper {
    display: flex;
    padding: 50px 0;
    background-color: white;
    justify-content: center;
    align-items: center;
  }

  .load-button-wrapper {
    width: 500px;
  }

  .load-button-title {
    font-size: 1.5rem;
  }
</style>
