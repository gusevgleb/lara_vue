<template>
  <div class="load-file-wrapper">
    <div class="d-flex flex-column load-button-wrapper">
      <strong class="mb-2 load-button-title">Цен нет</strong>
      <v-file-input v-model="priceListFile"
                    class="white--text"
                    label="Загрузить вручную"
                    outlined
                    dense/>

      <div class="d-flex align-center">
        <v-btn class="white--text"
               color="teal darken-2"
               elevation="5"
               @click="savePriceList">
          Отправить
        </v-btn>

        <v-checkbox class="ml-5"
                    label="Перезаписать существующие"
                    v-model="forceSaving"/>
      </div>

      <div>
        Убедитесь, что цены имеют вид "2500", а не "2 500", "2,500", "2.500" и пр.
        Отсутствующая или некорректная цена примет значение "999999". Заголовки столбцов:
        <b>id, name, price, excluded</b>
      </div>
    </div>

    <v-snackbar v-model="message.show">
      {{ message.text }}
    </v-snackbar>
  </div>
</template>

<script>
  import axios from 'axios'
  import {SAVE_PRICE_LIST_URL} from "../../../constants";

  export default {
    name: "PricesInput",
    props: {
      misServices: {
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
      forceSaving: false,
    }),
    methods: {
      savePriceList() {
        if (!this.priceListFile) {
          this.showMessage('Загрузите файл!');
          return;
        }

        let formData = new FormData();
        formData.append('file', this.priceListFile);
        formData.append('integration_id', this.integrationId);
        formData.append('mis_clinic_id', this.misClinicId);
        formData.append('force', this.forceSaving);

        let config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        axios.post(this.apiUrl + SAVE_PRICE_LIST_URL, formData, config)
          .then(response => {
            this.showMessage(response.data.message);
            location.reload();
          }).catch(error => {
          this.showMessage(error.response.data.message);
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
