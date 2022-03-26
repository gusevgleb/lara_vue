<template>
  <div>
    <v-card>
      <v-card-title>
        Вычеркнуть "{{ this.ServiceForExclude.mis_service_name }}" до:
      </v-card-title>

    <v-card-text>
      <v-menu
        ref="menu"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="date"
            label="Выбрать дату"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            v-on="on"
            dense
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="date"
          color="teal darken-2"
          :min="new Date().toISOString().substr(0, 10)"
          locale="ru-ru"
        ></v-date-picker>
      </v-menu>
    </v-card-text>

      <v-card-text>
        <input type="radio" id="one" value="auto_discard" v-model="excludeType">
        <label for="one">Автовычеркивание + оповещение</label>
        <br>
        <br>
        <input type="radio" id="two" value="notify" v-model="excludeType">
        <label for="two">Только оповещение</label>
      </v-card-text>

      <v-card-text>
        <v-alert
          v-model="alert.show"
          :type="alert.type"
          dismissible
        >
          {{ alert.message }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-row>
          <v-col>
            <v-tooltip bottom>
              <template v-slot:activator="{on, attrs}">
                <v-btn
                  class="white--text text-right mr-auto"
                  color="red darken-2"
                  text
                  @click="onSave(true)"
                  v-bind="attrs"
                  v-on="on"
                >
                  Отменить вычеркивание
                </v-btn>
              </template>
              <span>Уберет цену из списка временных</span>
            </v-tooltip>
          </v-col>

          <v-col  class="col-auto">
            <v-tooltip bottom>
              <template v-slot:activator="{on, attrs}">
                <v-btn
                  class="white--text text-right"
                  color="teal darken-2"
                  text
                  @click="onSave(false)"
                  v-bind="attrs"
                  v-on="on"
                >
                  Сохранить
                </v-btn>
              </template>
              <span>Применить логику для выбранной даты</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import {SET_TEMPORARY_EXCLUDED_URL} from "../../../constants";
export default {
  name: "TemporaryExcludeServiceModal.vue",

  props: {
    ServiceForExclude: {
      type: Object,
    },
  },

  data: () => ({
    date: '',
    excludeType: '',

    alert: {
      show: false,
      type: 'success',
      message: '',
    },
  }),

  methods: {
    onSave(discard) {
      if (discard) {
        this.setDataToNull();
      } else {
        if (!this.validate()) {
          return;
        }

        this.ServiceForExclude.excluded = true;
        this.ServiceForExclude.temporary_excluded_type = this.excludeType;
        this.ServiceForExclude.temporary_excluded_until = this.date;
      }

      axios.post(this.apiUrl + SET_TEMPORARY_EXCLUDED_URL, this.ServiceForExclude
      ).then(response => {
        this.showMessage('success', response.data.message);

        setTimeout(() => this.$emit('close-modal'), 1000)
      }).catch(error => {
        this.showMessage('error', error.response.data.message);
      });
    },

    setDataToNull() {
      this.ServiceForExclude.excluded = false;
      this.ServiceForExclude.temporary_excluded_type = null;
      this.ServiceForExclude.temporary_excluded_until = null;
      this.date = null;
      this.excludeType = null;
    },

    validate() {
      if (!this.date) {
        this.showMessage('error', 'Не выбрана дата!');
        return false;
      }

      if (!this.excludeType) {
        this.showMessage('error', 'Не выбран тип вычеркивания!');
        return false;
      }

      return true;
    },

    showMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },
  }
}
</script>
