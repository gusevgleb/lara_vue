<template>
  <v-form
      ref="form"
      v-model="isValidForm"
      lazy-validation
  >
    <v-card>
      <v-card-title>Создание цены</v-card-title>

      <v-card-text>
        <v-text-field
            v-model="name"
            label="Название услуги"
            required
            :rules="[v => !!v || 'Введите название услуги']"
            @focus="resetValidation"
            :disabled="loading"
        />

        <v-text-field
            v-model="price"
            label="Цена"
            required
            :rules="[v => !!v || 'Введите цену']"
            @focus="resetValidation"
            @keydown="filterTextField($event)"
            :disabled="loading"
        />

        <v-alert v-model="alert.show"
                 :type="alert.type"
                 width="100%"
                 dismissible
        >
          {{ alert.message }}
        </v-alert>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <v-spacer/>

        <v-btn
            color="green darken-2"
            text
            :loading="loading"
            :disabled="saved"
            @click="onSavePrice"
        >
          <span v-if="saved">
            Сохранено
          </span>

          <span v-else>
            Сохранить
          </span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { filterKeyboardNumbers } from "@/helpers";
import { POST_CREATE_PRICE} from "../../../../constants";
import axios from "axios";

export default {
  name: 'CreatePriceModal',

  props: {
    integrationId: {
      type: Number,
      default: 0,
    },

    misClinicId: {
      type: String,
      default: '',
    },

    clinicId: {
      type: Number,
      default: 0,
    },

    filialId: {
      type: Number,
      default: 0,
    },
  },

  data: () => ({
    isValidForm: false,
    loading: false,
    saved: false,

    name: '',
    price: 0,

    alert: {
      show: false,
      type: 'success',
      message: '',
    },
  }),

  methods: {
    onSavePrice() {
      if (!this.validate()) {
        return;
      }

      axios.post(this.apiUrl + POST_CREATE_PRICE, {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
        clinic_id: this.clinicId,
        filial_id: this.filialId,
        name: this.name.trim(),
        price: this.price
      }).then((response) => {
        this.saved = true;
        this.showMessage('success', response.data.message);
        this.$emit('save-all')
        this.$emit('reload-mis-data');
      }).catch((error) => {
        this.showMessage('error', error.response.data.message ?? 'Что-то пошло не так');
      })
    },

    validate() {
      return this.$refs.form.validate();
    },

    resetValidation() {
      this.alert.show = false;
      this.$refs.form.resetValidation();
    },

    filterTextField($event) {
      if (!filterKeyboardNumbers($event.keyCode, true)) {
        $event.preventDefault();
      }
    },

    showMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },
  },
}
</script>
