<template>
  <div class="load-file-wrapper">
    <div class="d-flex flex-column load-button-wrapper">
      <strong class="mb-2 load-button-title">Импорт режимов работы</strong>
      <v-file-input v-model="workTimesFile"
                    class="white--text"
                    label="Загрузить вручную"
                    outlined
                    dense/>

      <div class="d-flex align-center">
        <v-btn class="white--text"
               color="teal darken-2"
               elevation="5"
               @click="saveWorkTimes">
          Отправить
        </v-btn>
      </div>

      <div>
        <br><span>Формат: xlsx, 1 страница</span>
        <br><span>1 столбец - id, 2 столбец - name, 3 столбец - worktime</span>
      </div>
    </div>

    <v-snackbar v-model="message.show">
      {{ message.text }}
    </v-snackbar>
  </div>
</template>

<script>
  import axios from 'axios'
  import {SAVE_WORKTIMES_URL} from "../../../constants";

  export default {
    name: "WorkTimesInput",
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
      workTimesFile: null,
    }),
    methods: {
      saveWorkTimes() {
        if (!this.workTimesFile) {
          this.showMessage('Загрузите файл!');
          return;
        }

        let formData = new FormData();
        formData.append('integration_id', this.integrationId);
        formData.append('mis_clinic_id', this.misClinicId);
        formData.append('file', this.workTimesFile);

        let config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        axios.post(this.apiUrl + SAVE_WORKTIMES_URL, formData, config)
          .then(response => {
            if (!response.data.success) {
              this.showMessage(response.data.message);
            } else {
              this.showMessage('Режимов работы изменено: ' + response.data.counter);
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
