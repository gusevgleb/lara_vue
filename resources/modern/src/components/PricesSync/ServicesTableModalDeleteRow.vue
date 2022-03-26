<template>
  <v-card :loading="loading">
    <v-card-title class="headline">
      Удаление цены

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
        <div v-if="isCombined">
          <span>Вы действительно хотите удалить <strong>комбинированную цену</strong> "{{ serviceName }}"?</span>
        </div>

        <div v-else>
          <span>Вы действительно хотите удалить цену на услугу "{{ serviceName }}"?</span>
        </div>
      </div>

      <div v-if="isPartOfCombinedPrice" class="pb-2">
        <div class="pb-2">
          <span class="font-weight-bold red--text">Внимание! </span>
          <span>Эта цена есть в составе следующих комбинированных цен, которые тоже будут удалены:</span>
        </div>

        <ol>
          <li v-for="price in priceList" :key="price.id">
            {{ price.service_name }} - {{ price.price }} руб.
          </li>
        </ol>
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
  POST_DELETE_PRICE,
  POST_IS_PART_OF_COMBINED_PRICE,
} from '../../../constants';

const DEFAULT_ERROR_MESSAGE = 'Что-то пошло не так';

export default {
  name: 'ServicesTableModalDeleteRow',

  props: {
    item: {
      type: Object,
      default: () => ({
        combinedPrices: {},
      }),
    }
  },

  data: () => ({
    loading: false,
    isPartOfCombinedPrice: false,
    priceList: [],

    alert: {
      show: false,
      type: 'error',
      message: '',
    }
  }),

  created() {
    this.checkIsPartOfCombinedPrice();
  },

  computed: {
    serviceName() {
      if (this.isCombined) {
        return this.item.service_name;
      }

      return this.item.mis_service_name;
    },

    isCombined() {
      return Boolean(this.item.is_combined);
    },
  },

  methods: {
    checkIsPartOfCombinedPrice() {
      this.loading = true;

      axios.post(this.apiUrl + POST_IS_PART_OF_COMBINED_PRICE, {
        price_id: this.item.id
      }).then((response) => {
        if (!response.data.success) {
          this.alert.message = response.data.message
              ? response.data.message
              : DEFAULT_ERROR_MESSAGE;

          this.alert.show = true;

          return;
        }

        this.isPartOfCombinedPrice = response.data.result;

        if (this.isPartOfCombinedPrice) {
          this.priceList = response.data.price_list;
        }
      }).catch((error) => {
        this.alert.message = error;
        this.alert.show = true;
      }).finally(() => {
        this.loading = false;
      })
    },

    onClose() {
      this.$emit('close');
    },

    onDelete() {
      this.loading = true;
      this.$emit('save-all');

      axios.post(this.apiUrl + POST_DELETE_PRICE, {
        price_id: this.item.id,
        is_part_of_combined_price: this.isPartOfCombinedPrice,
      }).then((response) => {
        if (!response.data.success) {
          this.alert.message = response.data.message
              ? response.data.message
              : DEFAULT_ERROR_MESSAGE;

          this.alert.show = true;

          return;
        }

        this.deleteItemFromServicesTable();
        this.onClose();
      }).catch((error) => {
        this.alert.message = error;
        this.alert.show = true;
      }).finally(() => {
        this.loading = false;
      })
    },

    deleteItemFromServicesTable() {
      this.$emit('delete-from-services-table');
    },
  },
}
</script>
