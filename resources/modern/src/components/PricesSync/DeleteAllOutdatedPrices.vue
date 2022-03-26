<template>
  <v-card :loading="loading">
    <v-card-title class="headline">
      Удаление всех устаревших цен

      <v-spacer></v-spacer>

      <v-btn
          @click="onClose"
          icon
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="text--primary">
      <div class="pb-2">
          <span>Вы действительно хотите удалить все устаревшие цены для этой клиники?</span>
      </div>
    </v-card-text>

    <v-alert
        v-model="alert.show"
        :type="alert.type"
        dismissible
    >
      {{ alert.message }}
    </v-alert>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
          text
          @click="onClose"
          :disabled="loading"
      >
        Отмена
      </v-btn>
      <v-btn
          color="red darken-2"
          text
          @click="onDelete"
          :loading="loading"
      >
        Удалить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios';
import {
  POST_DELETE_ALL_OUTDATED_PRICES,
} from '../../../constants';

const DEFAULT_ERROR_MESSAGE = 'Что-то пошло не так';

export default {
  name: 'ServicesTableModalDeleteRow',

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

    alert: {
      show: false,
      type: 'error',
      message: '',
    }
  }),

  methods: {
    onClose() {
      this.$emit('close');
    },

    onDelete() {
      this.loading = true;

      axios.post(this.apiUrl + POST_DELETE_ALL_OUTDATED_PRICES, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
      }).then((response) => {
        if (!response.data.success) {
          this.alert.message = response.data.message
              ? response.data.message
              : DEFAULT_ERROR_MESSAGE;

          this.alert.show = true;

          return;
        }

        this.getMisData();
        this.onClose();
      }).catch((error) => {
        this.alert.message = error;
        this.alert.show = true;
      }).finally(() => {
        this.loading = false;
      })
    },

    getMisData() {
      this.$emit('get-mis-data');
    },
  },
}
</script>
