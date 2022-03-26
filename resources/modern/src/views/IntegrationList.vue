<template>
  <v-app>
    <div id="integrations">
      <div class="container-fluid">
        <div id="integrations_state">
          <v-row>
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                clearable
                class="search"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="2">
              <v-btn
                color="teal"
                dark
                :href = "apiUrl + 'internal/stata/new_integration'"
                class="mt-5"
                small
              >
                Новая интеграция
              </v-btn>
            </v-col>
          </v-row>

          <v-data-table fixed-header
                        :headers="headers"
                        :items="integrations"
                        :items-per-page="-1"
                        :footer-props="footerProps"
                        :sort-by.sync="sortField"
                        :sort-desc.sync="sortIsDesc"
                        :search="search"
                        dense
          >
            <template v-slot:item="{ item }">
              <tr :class="itemRowBackground(item)" :key="item.integrationId">
                <td class="integrationId">
                  <a :href="item.url">{{ item.integrationId }}</a>
                </td>
                <td class="integration">
                  <div class="editable">
                    <input
                      v-model="item.integration"
                      class="status-input"
                      @blur="changeData(item.integrationId, 'title', item.integration)"
                    >
                  </div>
                </td>
                <td class="city">
                  <div class="editable">
                    <input
                      v-model="item.city"
                      class="status-input"
                      @blur="changeData(item.integrationId, 'extra.city', item.city)"
                    >
                  </div>
                </td>
                <td class="drv_name">
                  {{ item.drvFamily }}
                </td>
                <td class="mis">
                  <div class="editable">
                    <input
                      v-model="item.mis"
                      class="status-input"
                      @blur="changeData(item.integrationId, 'extra.mis', item.mis)"
                    >
                  </div>
                </td>
                <td class="readonly">
                  <a href="" @click.prevent="openTypeDialog(item)">{{ item.type.is_full === 1 ? 'Полная' : 'Чтение' }}</a><br>

                </td>
                <td class="raw_logs">
                  <a :href="'/modern/private/last-raw-requests/' + item.integrationId">cм-ть запрос</a>
                </td>
                <td class="fields">
                  <a href="" @click.prevent="item.showFields = true;" v-if="!item.showFields">Показать ({{ item.fields.length }})</a>
                  <div v-else>
                    <div v-for="(field, j) in item.fields" v-bind:key="j">
                      {{ field }}<br>
                    </div>
                  </div>
                </td>
                <td class="email" style="max-width: 400px;">
                  <input
                    v-model="item.email"
                    class="status-input"
                    @blur="changeData(item.integrationId, 'extra.email', item.email)"
                  >
                </td>
                <td class="doctorList">
                  <a :href="item.doctorsUrl">Врачи</a>
                </td>
                <td class="remark">
                  <div class="editable">
                    <input
                      v-model="item.remark"
                      class="status-input"
                      @blur="changeData(item.integrationId, 'remarks', item.remark)"
                    >
                  </div>
                </td>
                <td class="contacts">
                  <div class="editable">
                    <input
                      v-model="item.contacts"
                      class="status-input"
                      @blur="changeData(item.integrationId, 'contacts', item.contacts)"
                    >
                  </div>
                </td>
                <td>
                  <div class="p">
                    <input
                      type="checkbox"
                      :checked="item.enable"
                      @click="changeStatus(item.integrationId, !item.enable)"
                    >
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>

          <v-dialog
            v-model="typeDialog"
            max-width="600"
            @keydown.esc="typeDialog = false"
            @close="typeDialog = false"
            :integration-id="integrationId"
          >
            <v-form
              ref="form"
              v-model="isValidForm"
              lazy-validation
            >
              <v-card>
                <v-card-title>
                  Редактирование типа интеграции #{{ integrationId }}
                </v-card-title>
                <v-card-text>
                  <v-checkbox
                    v-model="typeValue"
                    label="Полная?"
                    color="primary"
                  ></v-checkbox>
                  <v-text-field
                    label="Комментарий"
                    v-model="comment"
                    outlined
                    dense
                    required
                    color="primary"
                    @focus="resetValidation"
                  ></v-text-field>
                  Дата последнего изменения: {{ updatedAt }} (UTC)

                  <v-alert
                    v-model="alert.show"
                    :type="alert.type"
                    width="100%"
                    dismissible
                  >
                    {{ alert.message }}
                  </v-alert>
                </v-card-text>


                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    @click="changeType"
                  >
                    Сохранить
                  </v-btn>
                  <v-btn
                    color="grey"
                    text
                    @click="typeDialog = false"
                  >
                    Отмена
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>

        </div>
      </div>
    </div>
  </v-app>
</template>


<script>
import axios from "axios";

export default {
  name: "IntegrationList",

  created() {
    document.title = 'Список интеграций';
  },

  mounted() {
    this.getIntegrations();
  },

  data() {
    return {
      integrations: [],

      sortField: 'integrationId',
      sortIsDesc: false,

      headers: [
        {text: 'ID', value: 'integrationId', align: 'center'},
        {text: 'Интеграция', value: 'integration', align: 'center'},
        {text: 'Город', value: 'city', align: 'center'},
        {text: 'Драйвер', value: 'driver', align: 'center'},
        {text: 'МИС', value: 'mis', align: 'center'},
        {text: 'Тип', value: 'type', align: 'center'},
        {text: 'Запросы', value: 'requests', align: 'center'},
        {text: 'Поля', value: 'fields', align: 'left'},
        {text: 'E-mail', value: 'email', align: 'left'},
        {text: 'Врачи', value: 'doctors', align: 'center'},
        {text: 'Ремарка', value: 'remark', align: 'center'},
        {text: 'Контакты', value: 'contacts', align: 'center'},
        {text: 'Вкл/ Выкл', value: 'status', align: 'right'},
      ],

      footerProps: {
        'items-per-page-options': [-1],
        'items-per-page-text': 'Строк на странице:',
        'page-text': 'Всего: {2}',
      },

      integrationId: '',

      search: '',
      typeDialog: false,

      typeValue: false,
      comment: '',
      updatedAt: '',

      isValidForm: false,
      loading: false,

      alert: {
        show: false,
        type: 'success',
        message: '',
      },
    }
  },

  methods: {
    getIntegrations() {
      axios.get(this.apiUrl + 'internal/stata/drivers_modern', {})
        .then((response) => {
          this.integrations = Object.values(response.data.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    showFields(index) {
      this.integrations[index]['showFields'] = true;
    },

    changeStatus(integrationId, value) {
      axios.post(this.apiUrl + '/internal/status/update',
        {
          integrationId: integrationId,
          value: value
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },

    changeData(integrationId, field, value) {
      axios.post(this.apiUrl + '/internal/' + field + '/update',
        {
          integrationId: integrationId,
          newValue:      value,
        },
        {}
      )
        .catch((error) => {
          console.error(error);
        });
    },

    changeType() {
      axios.post(this.apiUrl + '/internal/stata/change_integration_type',
        {
          integrationId: this.integrationId,
          value: this.typeValue,
          comment: this.comment,
        }, {}
      )
        .then(() => {
          this.integrations.find((el, i) => {
            if (el.integrationId === this.integrationId) {
              el.type.is_full = this.typeValue;
              el.type.comment = this.comment;

              this.integrations[i] = el;
              return true;
            }
          });

          this.typeDialog = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },

    openTypeDialog(item) {
      this.integrationId = item.integrationId;
      this.typeValue = Boolean(item.type.is_full);
      this.comment = item.type.comment;
      this.updatedAt = item.type.updated_at;

      this.typeDialog = true;
    },

    validate() {
      return this.$refs.form.validate();
    },

    resetValidation() {
      this.alert.show = false;
      this.$refs.form.resetValidation();
    },

    showMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },

    itemRowBackground(item) {
      return item.status === 'active' ? '' : 'disabled-integration';
    }
  },
}
</script>

<style scoped>
  .disabled-integration {
    background-color: #f8d7da !important;
  }

  .disabled-integration:hover {
    background-color: #f0bec4 !important;
  }

  .default {

  }

  .search {
    max-width: 300px;
  }
</style>
