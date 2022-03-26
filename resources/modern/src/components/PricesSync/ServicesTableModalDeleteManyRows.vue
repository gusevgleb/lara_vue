<template>
  <v-card :loading="loading">
    <v-card-title class="headline">
      Удаление цен

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
        <div>
          <span>Вы действительно хотите удалить следующие цены?</span>
          <li v-for="price in notCombinedPrices" :key="price.id">
            <span>
              {{ price.mis_service_name }} [{{ price.mis_service_id }}]
            </span>
          </li>
        </div>
      </div>

      <div class="pb-2">
        <div class="pb-2">
          <span>Комбинированные цены:</span>
        </div>

        <ol>
          <li v-for="price in combinedPrices" :key="price.id">
            <span>
              Комбинированная, {{ price.service_name }}
            </span>
          </li>
        </ol>
      </div>

      <div v-if="isPartOfCombinedPrice" class="pb-2">
        <div class="pb-2">
          <span class="font-weight-bold red--text">Внимание! </span>
          <span>Эта есть цены в составе следующих комбинированных цен, которые тоже будут удалены:</span>
        </div>

        <ol>
          <li v-for="price in getPriceList()" :key="price.id">
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
  name: 'ServicesTableModalDeleteManyRows',

  props: {
    items: {
      type: Array,
      default: () => ([
        {
          combinedPrices: {},
        }
      ]),
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
    this.items.forEach(item => {
      this.checkIsPartOfCombinedPrice(item);
    })
  },

  computed: {
    combinedPrices() {
      let result = [];

      this.items.forEach(item => {
        if (item.is_combined) {
          result.push(item);
        }
      });

      return result;
    },

    notCombinedPrices() {
      let result = [];

      this.items.forEach(item => {
        if (!item.is_combined) {
          result.push(item);
        }
      });

      return result;
    },

    isCombined() {
      return Boolean(this.items.is_combined);
    },
  },

  methods: {
    getPriceList() {
      let result = [];

      this.priceList.forEach(price => {
        price.forEach(priceCombined => {
          result.push(priceCombined);
        })
      });

      return result;
    },

    checkIsPartOfCombinedPrice(item) {
      this.loading = true;

      axios.post(this.apiUrl + POST_IS_PART_OF_COMBINED_PRICE, {
        price_id: item.id
      }).then((response) => {
        if (!response.data.success) {
          this.alert.message = response.data.message
              ? response.data.message
              : DEFAULT_ERROR_MESSAGE;

          this.alert.show = true;

          return;
        }

        this.isPartOfCombinedPrice |= response.data.result;

        if (response.data.result) {
          this.priceList[item.id] = response.data.price_list;
        }
      }).catch((error) => {
        this.alert.message = error;
        this.alert.show = true;
      }).finally(() => {
        this.loading = false;
      })
    },

    onClose() {
      console.log('close-many');
      this.$emit('close-many');
    },

    onDelete() {
      this.loading = true;

      let events = [];
      this.$emit('save-all');

      this.items.forEach((item) => {
        events.push(axios.post(this.apiUrl + POST_DELETE_PRICE, {
          price_id: item.id,
          is_part_of_combined_price: !!(this.priceList[item.id]),
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
        }))
      });

      Promise.all()

      Promise.all(events).then(() => {
        this.loading = false;
      });
    },

    deleteItemFromServicesTable() {
      this.$emit('delete-from-services-table');
    },
  },
}
</script>
