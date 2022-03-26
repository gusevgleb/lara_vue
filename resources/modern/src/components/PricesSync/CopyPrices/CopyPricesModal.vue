<template>
  <v-form
      ref="form"
      v-model="isValidForm"
      lazy-validation
  >
    <v-card>
      <v-card-title>
        Скопировать цены на другой филиал
      </v-card-title>

      <v-card-text class="text--primary">
        <v-row>
          <v-col class="col-12">
            <div>
              <span>
                В выбранный филиал отправятся те цены, которые существуют и на текущем филиале, и на выбранном.
              </span>
            </div>
            <div>
              <span>
                <b>
                ВАЖНО: в выбранном филиале не должно быть сопоставленных цен!
                </b>
              </span>
            </div>
            <div>
              <span>
                <b>
                ВАЖНО: в текущем филиале не должно быть цен из файла и из МИС одновременно!
                </b>
              </span>
            </div>

            <div class="pt-3">
              <span>Также будут скопированы:</span>
              <ul>
                <li>Дубли</li>
                <li>Комбинированные цены</li>
                <li>Цены, залитые из файла</li>
                <li>Цены, созданные вручную</li>
              </ul>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col class="col-12">
            <v-autocomplete
                class="multiselect"
                v-model="targetClinicId"
                :items="misClinicIdsForCopyPrices"
                :loading="loading"
                label="Филиал"
                item-text="title"
                item-value="id"
                clearable
                @focus="resetValidation"
                required
                :rules="[v => !!v || 'Необходимо выбрать филиал']"
            ></v-autocomplete>
          </v-col>
        </v-row>

        <v-row v-if="alert.show">
          <v-col class="col-12 py-0">
            <v-alert v-model="alert.show"
                     :type="alert.type"
                     width="100%"
                     dismissible
            >
              <div>
                {{ alert.message }}
              </div>

              <div v-if="copied">
                <div>
                  <span>Всего цен в выбранном филиале: {{ targetClinicPricesCount }}</span>
                </div>

                <div>
                  <span>Цен скопировано: {{ allPricesCount }}, из которых:</span>
                </div>

                <div>
                  <span>- Обычных цен: {{ affectedRows }}</span>
                </div>

                <div v-if="!!affectedDuplicatedPrices">
                  <span>- Дублей: {{ affectedDuplicatedPrices }}</span>
                </div>

                <div v-if="!!affectedCombinedPrices">
                  <span>- Комбинированных: {{ affectedCombinedPrices }}</span>
                </div>

                <div v-if="!!affectedCreatedByUserPrices">
                  <span>- Созданных вручную: {{ affectedCreatedByUserPrices }}</span>
                </div>

                <div v-if="!!affectedImportedPrices">
                  <span>- Залитых из файла: {{ affectedImportedPrices }}</span>
                </div>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <v-spacer/>

        <v-btn
            color="green darken-2"
            text
            :loading="loading"
            :disabled="copied"
            @click="onSave"
        >
          <span v-if="copied">
            Скопировано
          </span>

          <span v-else>
            Скопировать
          </span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import axios from 'axios';
import { POST_COPY_PRICES } from '../../../../constants';

export default {
  name: 'CopyPricesModal',

  props: {
    integrationId: {
      type: Number,
      default: 0,
    },

    misClinicId: {
      type: String,
      default: '',
    },

    misClinicIdsForCopyPrices: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    isValidForm: false,
    loading: false,
    copied: false,
    targetClinicId: '',
    affectedRows: 0,
    affectedCombinedPrices: 0,
    affectedDuplicatedPrices: 0,
    affectedImportedPrices: 0,
    affectedCreatedByUserPrices: 0,
    targetClinicPricesCount: 0,

    alert: {
      show: false,
      type: 'success',
      message: '',
    },
  }),

  computed: {
    allPricesCount() {
      return this.affectedRows
        + this.affectedCombinedPrices
        + this.affectedDuplicatedPrices
        + this.affectedImportedPrices
        + this.affectedCreatedByUserPrices;
    },
  },

  methods: {
    onSave() {
      if (!this.validate()) {
        return;
      }

      this.loading = true;

      axios.post(this.apiUrl + POST_COPY_PRICES, {
          integration_id: this.integrationId,
          mis_clinic_id: this.misClinicId,
          target_clinic_id: this.targetClinicId
      }).then((response) => {
        const data = response.data;

        if (!data.success) {
          this.showSuccessMessage('error', 'Что-то пошло не так');

          return;
        }

        this.affectedRows = data.affected_rows;
        this.affectedCombinedPrices = data.affected_combined_prices;
        this.affectedDuplicatedPrices = data.affected_duplicated_prices;
        this.affectedImportedPrices = data.affected_imported_prices;
        this.affectedCreatedByUserPrices = data.affected_created_by_user_prices;
        this.targetClinicPricesCount = data.target_clinic_prices_count;
        this.copied = true;
        this.showSuccessMessage('success', data.message);
      }).catch((error) => {
        this.showSuccessMessage('error', error);
      }).finally(() => {
        this.loading = false;
      })
    },

    validate() {
      return this.$refs.form.validate();
    },

    resetValidation() {
      this.alert.show = false;
      this.$refs.form.resetValidation();
    },

    showSuccessMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },
  }
}
</script>
