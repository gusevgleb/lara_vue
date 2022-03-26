<template>
  <div>
    <v-row>
      <v-col class="col-auto mr-auto">
        <form :action="exportXlsxUrl" method="POST" class="mr-4 inline-block" >
          <input type="hidden" name="service_ids" :value="servicesIds.join(',')">
          <v-btn class="white--text text-transform-none"
                 color="blue darken-2"
                 elevation="0"
                 :disabled="loading"
                 type="submit"
          >
            Экспорт в XLSX (с фильтром)
          </v-btn>
        </form>

        <a :href="exportXlsxZalivatorUrl">
          <v-btn class="white--text text-transform-none mr-4"
                 color="blue darken-2"
                 elevation="0"
                 :disabled="loading"
          >
            Экспорт в XLSX (заливатор)
          </v-btn>
        </a>

        <a :href="exportXlsxBackup">
          <v-btn class="white--text text-transform-none mr-4"
                 color="blue darken-2"
                 elevation="0"
                 :disabled="loading"
          >
            Экспорт в XLSX (резервная копия)
          </v-btn>
        </a>
      </v-col>

      <v-col class="col-auto">
        <div class="d-flex align-center">
          <span class="mr-4">{{ matched }}</span>
          <div class="text-button save-btn">
              <v-btn @click="saveButton"
                     class="white--text text-transform-none"
                     color="teal darken-2"
                     elevation="0"
                     :loading="loading"
                     :disabled="loading"
              >
                Сохранить
              </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>

const EXPORT_XLSX_BASE_URL           = 'price/v1/export_xlsx';
const EXPORT_XLSX_ZALIVATOR_BASE_URL = 'price/v1/export_xlsx_zalivator';
const EXPORT_XLSX_BACKUP             = 'price/v1/export_xlsx_backup';

export default {
  name: "Footer",

  props: {
    matched: {
      type: String,
      default: "Сопоставлено: 0",
    },

    services: {
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

    loading: {
      type: Boolean,
      default: false,
    }
  },

  computed: {
    exportXlsxUrl() {
      let url = new URL(this.apiUrl + EXPORT_XLSX_BASE_URL);

      url.searchParams.append('integration_id', String(this.integrationId));
      url.searchParams.append('mis_clinic_id', this.misClinicId);

      return url;
    },

    servicesIds() {
      let ids = [];

      this.services.forEach((service) => {
        ids.push(service.id);
      })

      return ids;
    },

    exportXlsxZalivatorUrl() {
      let zalivatorUrl = new URL(this.apiUrl + EXPORT_XLSX_ZALIVATOR_BASE_URL);

      zalivatorUrl.searchParams.append('integration_id', String(this.integrationId));
      zalivatorUrl.searchParams.append('mis_clinic_id', this.misClinicId);

      return zalivatorUrl;
    },

    exportXlsxBackup() {
      let zalivatorUrl = new URL(this.apiUrl + EXPORT_XLSX_BACKUP);

      zalivatorUrl.searchParams.append('integration_id', String(this.integrationId));
      zalivatorUrl.searchParams.append('mis_clinic_id', this.misClinicId);

      return zalivatorUrl;
    },
  },

  methods: {
    saveButton() {
      this.$emit('save-clicked');
    },
  },
}

</script>

<style scoped>
  .text-transform-none {
    text-transform: none;
  }

  .inline-block {
    display: inline-block;
  }
</style>
