<template>
  <div>
    <v-form
        ref="form"
        v-model="isValidForm"
        lazy-validation
    >
      <v-card>
        <v-card-title>
          Комбинированная цена
        </v-card-title>

        <v-card-text>
          <span style="font-size: 12px;">*Красным обозначены устаревшие цены</span>
          <v-row>
            <v-col class="col-12">
              <v-autocomplete
                  class="multiselect"
                  v-model="ourServiceSelected"
                  :items="ourServices"
                  :loading="loading"
                  label="Наша услуга"
                  item-text="name"
                  item-value="id"
                  deletable-chips
                  clearable
                  small-chips
                  @focus="resetValidation"
                  required
                  :rules="[v => !!v || 'Необходимо выбрать нашу услугу']"
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="col-12">
              <v-autocomplete
                  class="multiselect"
                  v-model="misServicesSelected"
                  :items="misServicesFiltered"
                  :loading="loading"
                  label="Услуги из МИС"
                  item-text="mis_service_name"
                  item-value="id"
                  deletable-chips
                  clearable
                  small-chips
                  multiple
                  @focus="resetValidation"
                  required
                  :rules="[v => !!v.length || 'Необходимо выбрать одну или несколько услуг из МИС']"
              >
                <template v-slot:item="data">
                  <template>
                    <v-list-item-content>
                      <v-list-item-title v-html="data.item.mis_service_name"></v-list-item-title>
                      <v-list-item-subtitle v-html="'Цена: ' + data.item.price"></v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </template>

                <template v-slot:selection="select">
                  <v-chip
                    v-if="select.item.is_updating === false"
                    v-bind="select.attrs"
                    :input-value="select.selected"
                    @click="select.select"
                    @click:close="remove(select.item)"
                    color="red accent-1"
                    small
                  >
                    <v-avatar
                      left
                      @click="remove(select.item)"
                    >
                      <v-icon small>
                        mdi-close-circle
                      </v-icon>
                    </v-avatar>
                    <span>{{ select.item.mis_service_name }}</span>
                  </v-chip>
                  <v-chip
                    v-else
                    v-bind="select.attrs"
                    :input-value="select.selected"
                    @click="select.select"
                    @click:close="remove(select.item)"
                    small
                  >
                    <v-avatar
                      left
                      @click="remove(select.item)"
                    >
                      <v-icon small>
                        mdi-close-circle
                      </v-icon>
                    </v-avatar>
                    <span style="max-width: 95%">{{ select.item.mis_service_name }}</span>
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>

          <combined-price-modal-list
              v-if="misServicesSelected.length"
              :selected-mis-services="misServicesSelectedData"
              @on-change-computed-prices="onChangeComputedPrices"
          />

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

        <v-divider></v-divider>

        <v-card-actions>
          <div>
            Итоговая цена: {{ computedSum }}
          </div>

          <v-spacer></v-spacer>

          <v-btn
              color="green darken-2"
              text
              @click="saveCombinedPrice"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </div>
</template>

<script>
import axios from "axios";
import {GET_COMBINED_PRICE, SAVE_COMBINED_PRICE} from "../../../../constants";
import CombinedPriceModalList from "@/components/PricesSync/CombinedPrices/CombinedPriceModalList";

export default {
  name: "CombinedPriceModal",
  components: {CombinedPriceModalList},
  props: {
    misServices: {
      type: Array,
      default: () => [],
    },

    ourServices: {
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

    combinedPriceId: {
      type: Number,
      default: 0,
    },

    misServiceItem: {
      type: Object,
      default: () => {},
    },
  },

  created() {
    this.ourServiceSelected = 0;
    this.misServicesSelected = [];

    this.getCombinedPrice();
  },

  data: () => ({
    ourServiceSelected: 0,
    misServicesSelected: [],
    loading: false,
    isValidForm: false,
    computedPrices: {},
    computedSum: 0,

    alert: {
      show: false,
      type: 'success',
      message: '',
    }
  }),

  computed: {
    misServicesFiltered() {
      return this.misServices.filter((misService) => !misService.is_combined);
    },

    misServicesSelectedData() {
      return this.misServices.filter((misService) => this.misServicesSelected.indexOf(misService.id) !== -1);
    },
  },

  methods: {
    validate() {
      return this.$refs.form.validate();
    },

    resetValidation() {
      this.alert.show = false;
      this.$refs.form.resetValidation();
    },

    saveCombinedPrice() {
      if (!this.validate()) {
        return;
      }

      let misServices = this.misServicesSelectedData;
      let ourService = this.ourServices.find(service => service.id === this.ourServiceSelected);

      axios.post(this.apiUrl + SAVE_COMBINED_PRICE, {
        mis_clinic_id: this.misClinicId,
        integration_id: this.integrationId,
        our_service: ourService,
        mis_services: misServices,
        computed_prices: this.computedPrices,
        combined_price_id: this.combinedPriceId || 0
      }).then(response => {
        if (response.data.success) {
          this.showMessage('success', 'Сохранение прошло успешно!');
          const insertedCombinedInfo = response.data.data;

          let misServiceIndex = this.misServices.findIndex(misService => misService.id === insertedCombinedInfo.id);

          if (misServiceIndex !== -1) {
            this.misServices[misServiceIndex].id = insertedCombinedInfo.id;
            this.misServices[misServiceIndex].service_id = insertedCombinedInfo.service_id;
            this.misServices[misServiceIndex].price = insertedCombinedInfo.price;
            this.misServices[misServiceIndex].service_name = insertedCombinedInfo.service_name;
            this.misServices[misServiceIndex].comment_for_content = insertedCombinedInfo.comment_for_content;
          }

          this.$emit('save-all')
          this.$emit('reload-mis-data')
        } else {
          this.showMessage('error', 'При сохранении цены что-то пошло не так');
        }
      }).catch(error => {
        this.showMessage('error', error);
      });
    },

    getCombinedPrice() {
      let misServiceItemLength = Object.keys(this.misServiceItem).length;

      if (!this.combinedPriceId && misServiceItemLength === 0) {
        return;
      }

      if (misServiceItemLength !== 0 && !this.combinedPriceId) {
          this.misServicesSelected.push(this.misServiceItem);

          this.misServicesSelectedData.map((misService) => {
            const computedPrice = this.computedPrices[misService.id];

            misService.price = computedPrice.price;
            misService.coefficient = computedPrice.coefficient;
          })
      }

      if (this.combinedPriceId && misServiceItemLength === 0) {
        axios.post(this.apiUrl + GET_COMBINED_PRICE, {
          price_id: this.combinedPriceId,
        }).then(response => {
          let data = response.data;
          this.ourServiceSelected = data.service_id;

          let misServices = data.mis_services;
          this.misServicesSelected = Object.keys(misServices).map((misServiceId) => Number(misServiceId));
          this.computedPrices = misServices;

          this.misServicesSelectedData.map((misService) => {
            const computedPrice = this.computedPrices[misService.id];

            misService.price = computedPrice.price;
            misService.coefficient = computedPrice.coefficient;
          })
        }).catch(error => {
            this.showMessage('error', error.response.data.message ?? 'Неизвестная ошибка!');
        });
      }
    },

    showMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },

    onChangeComputedPrices(computedPrices) {
      this.computedPrices = computedPrices;
      this.calculateComputedSum();
    },

    calculateComputedSum() {
      let computedSum = 0;

      Object.keys(this.computedPrices).map((priceId) => {
        const computedPrice = this.computedPrices[priceId];
        computedSum += computedPrice.price * computedPrice.coefficient;
      });

      this.computedSum = computedSum;
    },

    remove(item) {
      this.misServicesSelected.forEach((el, index) => {
        if (el === item.id) {
          this.misServicesSelected.splice(index, 1);
        }
      });
    },
  }
}
</script>
