<template>
  <v-card>
    <v-card-title class="headline">
      Сбросить цены

      <v-spacer></v-spacer>

      <v-btn
          @click="onClose"
          icon
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="text--primary">
      <div>
        <span>
          Вы действительно хотите сбросить все изменения по ценам текущей клиники?
          Это действие необратимо, придётся сопоставлять всё заново
        </span>

        <v-icon dark>
          &#128563;
        </v-icon>
      </div>

      <div class="pt-3">
        <span>Также будут удалены:</span>
        <ul>
          <li>Дубли</li>
          <li>Комбинированные цены</li>
          <li>Цены, залитые из файла</li>
          <li>Цены, созданные вручную</li>
        </ul>
      </div>

      <v-row v-if="alert.show">
        <v-alert v-model="alert.show"
                 :type="alert.type"
                 width="100%"
                 dismissible
        >
          {{ alert.message }}
        </v-alert>
      </v-row>

    </v-card-text>

    <v-divider/>

    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn
          text
          @click="onClose"
      >
        Отмена
      </v-btn>

      <v-btn
          color="red darken-2"
          text
          @click="onReset"
      >
        Сбросить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios';
import { POST_RESET_ALL_PRICES } from '../../../../constants';

export default {
  name: 'ResetPrices',

  props: {
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
    loading: false,
    success: false,

    alert: {
      show: false,
      type: 'success',
      message: '',
    }
  }),

  methods: {
    onClose() {
      this.$emit('close');
    },

    onReset() {
      this.loading = true;

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

    showMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },
  },
}
</script>
