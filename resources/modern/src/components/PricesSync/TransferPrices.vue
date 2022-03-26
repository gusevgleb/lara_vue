<template>
  <v-card :loading="loading">
    <v-card-title class="headline">
      Перенос цен на другую интеграцию

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
        <span>Неперенесенные цены будут отмечены как устаревшие.</span>
        <br>
        <span>Созданные вручную цены перенесены не будут.</span>
        <br>
        <span>На целевой клинике не должно быть сопоставленных цен.</span>
        <br>
        <span><b>Дважды проверьте корректность внесенных данных!</b></span>
      </div>
      <br>
      <v-text-field
          v-model="newIntegrationId"
          label="Новый integration_id"
          required
          :disabled="loading"
      />

      <v-text-field
          v-model="newMisClinicId"
          label="Новый mis_clinic_id"
          :disabled="loading"
      />
      <input type="radio" id="mis_service_name" value="1" v-model="compareType">
      <label for="mis_service_name">Сравнить цены по названию</label>
      <br>
      <input type="radio" id="mis_service_id" value="2" v-model="compareType">
      <label for="mis_service_id">Сравнить цены по айди</label>


      <div v-if="transferSuccess">
        <br>
        <span> Перенесено обычных цен: {{ transferredCommonCount }}</span>
      </div>

      <div v-if="transferSuccess">
        <span> Перенесено дублей: {{ transferredDuplicateCount }}</span>
      </div>

      <div v-if="transferSuccess">
        <span> Перенесено комбинированных: {{ transferredCombinedCount }}</span>
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
          @click="transferPrices"
          :loading="loading"
      >
        Перенести
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios';
import {
  TRANSFER_PRICES_URL,
} from '../../../constants';

export default {
  name: 'TransferPrices',

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
    transferSuccess: false,

    newIntegrationId: 0,
    newMisClinicId: '',
    compareType: '',
    transferredDuplicateCount: 0,
    transferredCommonCount: 0,
    transferredCombinedCount: 0,

    alert: {
      show: false,
      type: 'success',
      message: '',
    },
  }),

  methods: {
    onClose() {
      this.$emit('close');
    },

    transferPrices() {

      let data = {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
        new_integration_id: this.newIntegrationId,
        new_mis_clinic_id: this.newMisClinicId,
        compare_type: this.compareType,
      };
      axios.post(this.apiUrl + TRANSFER_PRICES_URL, data).then(response => {
        if (!response.data.success) {
          this.showSuccessMessage('error', 'Заполнены не все данные!');
          return;
        }

        this.transferredCommonCount = response.data.data.transfer_common_count;
        this.transferredDuplicateCount = response.data.data.transfer_duplicates_count;
        this.transferredCombinedCount = response.data.data.transfer_combined_count;
        this.transferSuccess = true;

        this.showSuccessMessage('success', response.data.message);
      }).catch((error) => {
        this.showSuccessMessage('error', error);
      });

    },

    showSuccessMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },
  },
}
</script>
