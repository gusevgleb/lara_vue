<template>
  <v-app>
    <v-container fluid class="v-container-fluid">
      <v-text-field
        ref="ourService"
        label="Поиск по нашей услуге"
        v-model="ourService"
        dense
        class="text-input"
        clearable
        color="teal"
      >
      </v-text-field>
      <v-text-field
        label="Поиск по услуге МИС"
        v-model="misService"
        dense
        class="text-input"
        clearable
        color="teal"
      >
      </v-text-field>
      <v-text-field
        label="Поиск в интеграции"
        v-model="integrationSearch"
        dense
        class="text-input"
        clearable
        color="teal"
      >
      </v-text-field>
      <v-text-field
        label="Поиск по id клиники"
        v-model="misClinicIdSearch"
        dense
        class="text-input"
        clearable
        color="teal"
      >
      </v-text-field>
      <v-btn
        @click="search"
        color="teal"
        dark
        :disabled="ourService === '' && misService === '' && integrationSearch === '' && misClinicIdSearch === ''"
      >
        <v-icon
          left
          dark
        >
          mdi-magnify
        </v-icon>
        Искать
      </v-btn>
    </v-container>

    <v-data-table
      show-select
      :headers="headers"
      :items="prices"
      :items-per-page="perPageCount"
      :page.sync="currentPage"
      class="elevation-1 pt-2"
      :loading="loading"
      loading-text="Загрузка данных..."
      hide-default-footer
    >
      <template v-slot:header.data-table-select>
        <div style="display: inline-block">
          <v-simple-checkbox
            v-model="allSelected"
            @click="selectAll"
            :indeterminate="selectedPrices.length > 0 && !allSelected"
            color="teal"
          />
        </div>
      </template>

      <template v-slot:top>
        <v-row class="sticky">
          <v-col class="pt-0 pb-0" cols="12" sm="1">
            <p class="ml-3 mr-3 mt-2 mb-2">Выбрано: <b>{{ selectedPrices.length }}</b></p>
          </v-col>
          <v-col class="pt-0 pb-0" cols="12" sm="11">
            <div class="ml-3">
              <span class="vertical-separator ml-2 mr-2"/>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="exclude(1)"
                         class="mr-1 mb-1"
                         color="yellow darken-2"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-alphabetical-variant-off
                    </v-icon>
                  </v-btn>
                </template>
                <span>Вычеркнуть</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="exclude(0)"
                         class="mr-1 mb-1"
                         color="teal"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-alphabetical-variant
                    </v-icon>
                  </v-btn>
                </template>
                <span>Убрать из вычеркнутого</span>
              </v-tooltip>

              <span class="vertical-separator ml-2 mr-2"/>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="duplicate"
                         class="mr-1 mb-1"
                         color="primary"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-content-duplicate
                    </v-icon>
                  </v-btn>
                </template>
                <span>Создать дубль</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="createChild"
                         class="mr-1 mb-1"
                         color="primary"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-teddy-bear
                    </v-icon>
                  </v-btn>
                </template>
                <span>Создать детские</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="changeServiceType(true)"
                         class="mr-1 mb-1"
                         color="primary"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-doctor
                    </v-icon>
                  </v-btn>
                </template>
                <span>Сделать услуги приёмами</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="changeServiceType(false)"
                         class="mr-1 mb-1"
                         color="primary"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-needle
                    </v-icon>
                  </v-btn>
                </template>
                <span>Сделать приёмы услугами</span>
              </v-tooltip>

              <span class="vertical-separator ml-2 mr-2"/>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="edit"
                         class="mr-1 mb-1"
                         color="teal"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                </template>
                <span>Редактировать</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="disconnect"
                         class="mr-1 mb-1"
                         color="yellow darken-2"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-lock-open-variant
                    </v-icon>
                  </v-btn>
                </template>
                <span>Отвязать</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="showRemoveDialog = true;"
                         class="mr-1 mb-1"
                         color="red"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                         :disabled="selectedPrices.length === 0"
                  >
                    <v-icon>
                      mdi-delete-forever
                    </v-icon>
                  </v-btn>
                </template>
                <span>Удалить</span>
              </v-tooltip>
            </div>
          </v-col>
        </v-row>
      </template>

      <template v-slot:item="{ item : rowItem }">
        <tr
          :key="rowItem.id"
          :class="{
            'excluded-pink-row': rowItem.excluded,
            'connected-green-row': rowItem.service_id || rowItem.np_workplaces.length && rowItem.is_reception,
            'connected-and-excluded-row': ((rowItem.service_id && rowItem.excluded) || (rowItem.reception_name && rowItem.excluded))
          }"
        >
          <td class="pr-0 pl-1">
            <v-simple-checkbox
              @click="rowItem.is_selected = !rowItem.is_selected; anythingSelected = true; selectPrice(rowItem)"
              :value="rowItem.is_selected"
              v-ripple
              class="ml-3"
            ></v-simple-checkbox>
          </td>
          <td class="pt-2 pr-0 pl-1 align-vertical">
            <span v-if="rowItem.info.filialTitle !== null">
              <a
                class="text-black" title="Cсылка на клинику в админке"
                :href="'https://admin.napopravku.ru/clinics/' + rowItem.info.filialId + '/contacts/'" target="_blank"
              >
                {{ rowItem.info.filialTitle }} ({{ rowItem.info.filialCity }})
              </a>
            </span>
            <span v-else>
              <a
                class="text-black" title="Cсылка на клинику в админке"
                :href="'https://admin.napopravku.ru/clinics/' + rowItem.info.clinicId + '/contacts/'" target="_blank"
              >
                {{ rowItem.info.clinicTitle }} ({{ rowItem.info.clinicCity }})
              </a>
            </span>
          </td>
          <td class="pt-2 pr-0 pl-1 align-vertical text-center">
            {{ rowItem.integration_id }}
          </td>
          <td class="pt-2 pr-0 pl-1 align-vertical text-center">
            {{ rowItem.mis_clinic_id }}
          </td>
          <td class="pt-2 pr-0 pl-1 align-vertical text-center" :class="{'striked-through' : rowItem.excluded}">
            <div v-if="rowItem.is_combined">
              <p v-for="combinedPrice in rowItem.combined_prices" :key="combinedPrice.id">
                {{ combinedPrice.mis_service_id }}
              </p>
            </div>
            <span v-else>
              {{ rowItem.mis_service_id }}
            </span>
          </td>
          <td class="pt-2 align-vertical text-center">
            <v-icon
              v-if="rowItem.is_reception"
              title="Приём"
              class="status-icon"
              small
            >
              mdi-doctor
            </v-icon>
            <v-icon
              v-else
              title="Услуга"
              class="status-icon"
              small
            >
              mdi-needle
            </v-icon>
            <br>
            <v-icon
              v-if="rowItem.has_children_analog === true"
              title="Можно сделать детскую"
              class="status-icon"
              small
            >
              mdi-teddy-bear
            </v-icon>
          </td>
          <td
            class="pt-2 pr-0 pl-1"
            :class="{
              'striked-through' : rowItem.excluded,
              'duplicate' : rowItem.duplicate
            }"
          >
            <div v-if="rowItem.is_combined" class="service-name">
              <p v-for="combinedPrice in rowItem.combined_prices" :key="combinedPrice.id">
                {{ combinedPrice.mis_service_name }}
              </p>
            </div>
            <span v-else class="service-name">
              {{ rowItem.mis_service_name }}
            </span>
            <span v-if="rowItem.duplicate" class="duplicate-text"><br>дубль</span>
          </td>
          <td class="pt-2 pr-0 pl-1">
            <v-icon
              v-if="rowItem.is_created_by_user && !rowItem.duplicate && !rowItem.is_combined"
              title="Ручная цена"
              class="status-icon"
              small
            >
              mdi-hand-coin-outline
            </v-icon>
            <v-icon
              v-if="!rowItem.imported && !rowItem.is_created_by_user && !rowItem.duplicate && !rowItem.is_combined"
              title="Из МИС"
              class="status-icon"
              small
            >
              mdi-cloud-sync-outline
            </v-icon>
            <v-icon
              v-if="rowItem.imported && !rowItem.is_created_by_user && !rowItem.duplicate && !rowItem.is_combined"
              title="Из файла"
              class="status-icon"
              small
            >
              mdi-file-table-outline
            </v-icon>
            <span class="status-input" :class="{'striked-through' : rowItem.excluded}">
              {{ rowItem.price }}
            </span>
          </td>
          <td class="pt-2 pr-1 pl-1">
            {{ rowItem.comment }}
          </td>
          <td class="pt-2 pr-0 pl-1" :class="{'striked-through' : rowItem.excluded}">
            <div v-if="rowItem.is_reception === 1">
              {{ rowItem.reception_name }}
              <ul>
                <li v-for="(workplace, i) in JSON.parse(rowItem.np_workplaces)" v-bind:key="i">
                  {{ workplace }}
                </li>
              </ul>
            </div>
            <span v-else>
              {{ rowItem.service_name }}
            </span>
            <div v-if="rowItem.is_combined === 1">
              <v-btn @click="openCombined(rowItem)"
                     class="mr-1 mb-1"
                     color="black"
                     elevation="0"
                     icon
                     text
                     disabled
              >
                <v-icon>
                  mdi-animation
                </v-icon>
              </v-btn>
            </div>
          </td>
          <td class="pr-0 pl-1 text-center">
            <v-simple-checkbox
              :value="rowItem.is_min_price"
            ></v-simple-checkbox>
          </td>
          <td class="pt-2 pr-0 pl-1">
            <span v-for="service in getServicesByIds(rowItem.excluded_service_ids)" :key="service.id">
              {{ service.name }}
              <br>
            </span>
          </td>
          <td class="pr-0 pl-1">
            <div v-if="rowItem.is_created_by_user">
              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <div
                    v-on="on"
                    v-bind="attrs"
                  >
                    <v-icon>
                      mdi-hand-heart
                    </v-icon>
                  </div>
                </template>
                <span>Ручная цена не может быть устаревшей</span>
              </v-tooltip>
            </div>
            <div v-else>
              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-simple-checkbox
                    :value="!rowItem.is_updating"
                    color="red darken-3"
                    v-on="on"
                    v-bind="attrs"
                    class="text-center"
                  ></v-simple-checkbox>
                </template>
                <span>{{ rowItem.updated_at }}</span>
              </v-tooltip>
            </div>
          </td>
        </tr>
      </template>

      <template v-slot:footer>
        <v-row>
          <v-col cols="12" sm="1">
            <v-select
              :items="perPageValues"
              label="Solo field"
              solo
              dense
              v-model="perPageCount"
              class="per-page-input mt-1"
              @change="currentPage = 1; search()"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="11">
            <v-pagination
              v-model="currentPage"
              :length="pageCount"
              circle
              color="teal"
              :total-visible="7"
              @input="search"
            ></v-pagination>
          </v-col>
        </v-row>
      </template>
    </v-data-table>

    <v-dialog
      max-width="600"
      v-model="showDialog"
    >
      <template>
        <v-card>
            <v-toolbar
              color="teal"
              dark
              class="textBold"
            >
              <b>Изменение цены</b>
              <v-spacer/>
              <v-btn
                icon
                dark
                @click="showDialog = false"
              >
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <p class="mt-3">
                Вы собираетесь изменить цены в количестве: <b>{{ selectedPrices.length }}</b>!
              </p>
              <v-textarea
                label="Название услуги в МИС"
                outlined
                dense
                v-model="currentMisService"
                color="teal"
                rows="1"
                auto-grow
                readonly
              ></v-textarea>
              <v-autocomplete
                v-model="currentService"
                :items="ourServices"
                dense
                outlined
                label="Наша услуга"
                color="teal"
                item-text="name"
                item-value="id"
                clearable
              >
              </v-autocomplete>
              <v-text-field
                label="Цена"
                outlined
                dense
                v-model="currentPrice"
                color="teal"
                clearable
              ></v-text-field>
              <v-text-field
                label="Комментарий"
                outlined
                dense
                v-model="comment"
                color="teal"
                clearable
              ></v-text-field>
              <v-autocomplete
                v-model="additionalServices"
                :items="ourServices"
                dense
                outlined
                label="Доп. услуги"
                color="teal"
                multiple
                item-text="name"
                item-value="id"
                clearable
              >
              </v-autocomplete>
              <v-checkbox
                v-model="isMinPrice"
                label="Цена от?"
                color="teal"
                class="mt-1 mb-3"
              ></v-checkbox>
              <v-checkbox
                v-model="isOutdated"
                label="Устарела?"
                color="teal"
                class="mt-1 mb-3"
              ></v-checkbox>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                text
                color="grey"
                @click="showDialog = false;"
              >
                Отмена
              </v-btn>
              <v-btn
                text
                color="teal"
                @click="save"
              >
                Сохранить
              </v-btn>
            </v-card-actions>
        </v-card>
      </template>
    </v-dialog>

    <v-dialog
      max-width="800"
      v-model="showRemoveDialog"
      persistent
    >
      <template>
        <v-card>
          <v-toolbar
            color="red"
            dark
            class="textBold"
          >
            <b>Удаление цены</b>
            <v-spacer/>
            <v-btn
              icon
              dark
              @click="showRemoveDialog = false"
            >
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <p class="mt-3">
              Вы собираетесь удалить цены в количестве: <b>{{ selectedPrices.length }}</b>!
            </p>
            <ul v-for="(service, i) in selectedPrices" v-bind:key="i">
              <li><b>ID интеграции:</b> {{ service.integration_id }}; <b>ID клиники:</b> {{ service.mis_clinic_id }}
                <br><b>Услуга МИС: </b>{{ service.mis_service_name }}
                <br><b>Наша услуга: </b>{{ service.service_name }}</li>
            </ul>
            <br>
            <p class="danger-text">
              Данное действие нельзя будет отменить!
            </p>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              text
              color="grey"
              @click="showRemoveDialog = false;"
            >
              Отмена
            </v-btn>
            <v-btn
              text
              color="red"
              @click="remove"
            >
              Да, удалить
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>

    <v-dialog
      max-width="600"
      v-model="showCombinedDialog"
    >
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
                  v-model="combinedOurService"
                  :items="ourServices"
                  :loading="combinedLoading"
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
                  v-model="combinedMisServicesSelected"
                  :items="misServices"
                  :loading="combinedLoading"
                  label="Услуги из МИС"
                  item-text="mis_service_name"
                  item-value="mis_service_id"
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
                      <v-list-item-content :class="{'outdated-price': data.item.is_updating === 0,}" @click="addToSelected(data.item)">
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
                      @click:close="removeFromSelected(select.item)"
                      color="red accent-1"
                      small
                    >
                      <v-avatar
                        left
                        @click="removeFromSelected(select.item)"
                      >
                        <v-icon small>
                          mdi-close-circle
                        </v-icon>
                      </v-avatar>
                      <span>{{ select.item.mis_service_name }}</span>
                      <span>test</span>
                    </v-chip>
                    <v-chip
                      v-else
                      v-bind="select.attrs"
                      :input-value="select.selected"
                      @click="select.select"
                      @click:close="removeFromSelected(select.item)"
                      small
                    >
                      <v-avatar
                        left
                        @click="removeFromSelected(select.item)"
                      >
                        <v-icon small>
                          mdi-close-circle
                        </v-icon>
                      </v-avatar>
                      <span>{{ select.item.mis_service_name }}</span>
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>

            <v-list>
              <v-list-item-group>
                <v-list-item
                  :ripple="false" class="row"
                  v-for="(listItem, i) in combinedMisServicesSelected"
                  :key="i"
                >
                  <v-list-item-content>
                    {{ listItem.mis_service_name }}
                  </v-list-item-content>

                  <v-list-item-action class="col-3 my-0 py-0">
                    <v-text-field
                      v-model="listItem.coefficient"
                      :suffix="String(listItem.coefficient * listItem.price)"
                      @keydown="filterTextField($event)"
                    />
                  </v-list-item-action>
                </v-list-item>

              </v-list-item-group>
            </v-list>

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
            <div class="ml-3">
              Итоговая цена: {{ computedPrice }}
            </div>

            <v-spacer></v-spacer>

            <v-btn
              color="green darken-2"
              text
              @click="saveCombined"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
    >
      {{ message }}

      <v-btn
        color="red"
        icon
        text
        @click="snackbar = false"
      >
        <v-icon small>
          mdi-close
        </v-icon>
      </v-btn>
    </v-snackbar>

  </v-app>
</template>

<script>
import axios from "axios";
import {filterKeyboardNumbers} from "@/helpers";
import {GET_NP_WORKPLACES} from "../../constants";

export default {
  name: "MultiPriceSync",

  created() {
    document.title = 'Множественное редактирование';

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') {
        this.search();
      }
    });
  },

  data: () => ({
    headers: [
      {text: 'Название клиники', value: 'info.clinicTitle', align: 'center'},
      {text: 'ID интеграции', value: 'integration_id', align: 'center'},
      {text: 'ID клиники', value: 'mis_clinic_id', align: 'center'},
      {text: 'ID в МИС', value: 'mis_service_id', align: 'center'},
      {text: 'Тип', value: 'service_reception', align: 'center'},
      {text: 'Название услуги в МИС', value: 'mis_service_name', width: 300, align: 'center'},
      {text: 'Цена', value: 'price', width: 80, align: 'center'},
      {text: 'Комментарий', value: 'comment', align: 'center'},
      {text: 'Наша услуга/врач', value: 'service_id', width: 300, align: 'center'},
      {text: 'Цена от?', value: 'is_min_price', width: 80, align: 'center'},
      {text: 'Доп. услуги', value: 'excluded_service_ids', align: 'center'},
      {text: 'Устарела?', value: 'is_updating', width: 60, align: 'center'},
    ],

    footerProps: {
      'items-per-page-options': [5, 10, 100, -1],
      'items-per-page-text': 'Строк на странице:',
      'page-text': '{0}-{1} из {2}',
    },

    loading: false,
    showDialog: false,
    error: false,
    showRemoveDialog: false,

    prices: [],
    selectedPrices: [],
    ourServices: [],
    workplaces: [],

    ourService: '',
    misService: '',
    integrationSearch: '',
    misClinicIdSearch: '',

    allSelected: false,
    anythingSelected: false,

    options: {},
    currentPage: 1,
    pageCount: 0,
    perPageCount: 10,

    perPageValues: [10, 50, 100, 500, -1],

    combinedOurService: null,
    combinedMisServicesSelected: [],

    showCombinedDialog: false,
    combinedLoading: false,
    isValidForm: false,
    computedPrices: {},
    misServices: [],
    misServiceName: '',
    summary: 0,

    alert: {
      show: false,
      type: 'success',
      message: '',
    },

    currentMisService: '',
    currentPrice: '',
    comment: '',
    currentService: '',
    additionalServices: '',
    isMinPrice: false,
    isOutdated: false,

    snackbar: false,
    message: '',
  }),

  computed: {
    computedPrice() {
      let sum = 0;

      this.combinedMisServicesSelected.forEach((service) => {
        sum += service.coefficient * service.price;
      });
      return sum;
    }
  },

  watch: {
    ourService: function() {
      if (this.ourService === null) {
        this.ourService = '';
      }
    },
    misService: function() {
      if (this.misService === null) {
        this.misService = '';
      }
    },
    integrationSearch: function() {
      if (this.integrationSearch === null) {
        this.integrationSearch = '';
      }
    },
    misClinicIdSearch: function() {
      if (this.misClinicIdSearch === null) {
        this.misClinicIdSearch = '';
      }
    },

    selectedPrices: function() {
      if (this.selectedPrices.length === this.prices.length) {
        this.allSelected = true;
      }

      if (this.selectedPrices.length === 0) {
        this.allSelected = false;
      }
    },
  },

  mounted() {
    this.getOurServices();
  },

  methods: {
    search() {
      this.loading = true;
      this.selectedPrices = [];
      this.prices = [];

      axios.post(this.apiUrl + 'price/v1/multi/search_prices', {
        ourService: this.ourService,
        misService: this.misService,
        integrationId: this.integrationSearch,
        misClinicId: this.misClinicIdSearch,

        currentPage: this.currentPage,
        perPageCount: this.perPageCount,
      }, {})
        .then((response) => {
          this.loading = false;
          this.pageCount = response.data.pages;
          this.prices = response.data.prices;
          this.options = {sortBy: null, sortDesc: null, page: this.currentPage, itemsPerPage: this.perPageCount};
        })
        .catch((error) => {
          console.error(error.response.data.error);
          this.loading = false;

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    getOurServices() {
      axios.get(this.apiUrl + 'price/v1/multi/get_our_services', {})
        .then((response) => {
          this.ourServices = response.data.services;
        })
        .catch((error) => {
          console.error(error.response.data.error);

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    remove() {
      if (this.selectedPrices.length === 0) {
        return;
      }

      axios.post(this.apiUrl + 'price/v1/multi/remove_prices', {
        selected: this.selectedPrices,
      }, {})
        .then(() => {
          this.showRemoveDialog = false;
          this.search();
        })
        .catch((error) => {
          console.error(error.response.data.error);

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    exclude(state) {
      if (this.selectedPrices.length === 0) {
        return;
      }

      axios.post(this.apiUrl + 'price/v1/multi/exclude_prices', {
        selected: this.selectedPrices,
        state: state,
      }, {})
        .then(() => {
          this.search();
        })
        .catch((error) => {
          console.error(error)

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    duplicate() {
      if (this.selectedPrices.length === 0) {
        return;
      }

      axios.post(this.apiUrl + 'price/v1/multi/duplicate_prices', {
        selected: this.selectedPrices,
      }, {})
        .then(() => {
          this.search();
        })
        .catch((error) => {
          console.error(error)

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    getServicesByIds(ids) {
      if (ids === null) {
        return [];
      }

      let names = [];

      this.ourServices.forEach(function (service) {
        if (ids.includes(service.id)) {
          names.push(service);
        }
      })

      return names;
    },

    edit() {
      if (this.selectedPrices.length === 0) {
        return;
      }

      let current = this.selectedPrices[0];

      this.currentMisService = current.mis_service_name;
      this.currentPrice = current.price;
      this.comment = current.comment;
      this.currentService = current.service_id;
      this.excluded_service_ids = current.excluded_service_ids;
      this.isMinPrice = current.is_min_price;
      this.isOutdated = !current.is_updating;

      this.showDialog = true;
    },

    selectAll() {
      this.anythingSelected = false;
      this.allSelected = this.allSelected === true;
      this.selectedPrices = [];

      this.prices.forEach((price) => {
        price.is_selected = this.allSelected;

        if (this.allSelected) {
          this.selectedPrices.push(price);
        }
      });
    },

    selectPrice(price) {
      let index = this.selectedPrices.indexOf(price)

      if (index !== -1) {
        this.selectedPrices.splice(index, 1)
      } else {
        this.selectedPrices.push(price);
      }
    },

    save() {
      if (this.selectedPrices.length === 0) {
        return;
      }

      axios.post(this.apiUrl + 'price/v1/multi/edit_prices', {
        selected: this.selectedPrices,
        data: {
          price: this.currentPrice,
          comment: this.comment,
          service_id: this.currentService,
          service_name: this.ourServices.find(service => service.id === this.currentService).name,
          excluded_service_ids: JSON.stringify(this.additionalServices),
          is_min_price: this.isMinPrice,
          is_updating: !this.isOutdated,
        },
      }, {}).then(() => {
        this.search();
        this.showDialog = false;
      })
        .catch((error) => {
          console.error(error)

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    open(item) {
      this.getNpWorkplaces(item);
    },

    createChild() {
      axios.post(this.apiUrl + 'price/v1/multi/create_child_prices', {
        selected: this.selectedPrices,
      }, {})
        .then(() => {
          this.search();
        })
        .catch((error) => {
          console.error(error.response.data.error)

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    changeServiceType(is_reception) {
      axios.post(this.apiUrl + 'price/v1/multi/change_service_type', {
        selected: this.selectedPrices,
        is_reception: is_reception
      }, {})
        .then(() => {
          this.search();
        })
        .catch((error) => {
          console.error(error);

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    disconnect() {
      if (this.selectedPrices.length === 0) {
        return;
      }

      axios.post(this.apiUrl + 'price/v1/multi/connect_prices', {
        selected: this.selectedPrices,
      }, {})
        .then(() => {
          this.search();
        })
        .catch((error) => {
          console.error(error);

          this.message = error.response.data.error;
          this.snackbar = true;
        });
    },

    getNpWorkplaces(item) {
      axios.post(this.apiUrl + GET_NP_WORKPLACES, {
        integration_id: item.integration_id,
        mis_clinic_id: item.mis_clinic_id,
      })
        .then(response => {
        this.workplaces = Object.values((response.data.workplaces));

        this.workplaces.map((workplace, index) => {
          this.workplaces[index].display_name = this.getDisplayName(workplace);
        });
      })
    },

    getDisplayName({id, name, specialities}) {
      return `${name} — (${specialities}) [${id}]`;
    },

    autocompleteChanged(item) {
      this.setAdditionalData(item);
    },

    setAdditionalData(item) {
      let ourService = this.ourServices.find((service) => {
        return service.id === item.service_id;
      });

      axios.post(this.apiUrl + 'price/v1/multi/connect_prices', {
        selected: this.selectedPrices,
        data: ourService,
      }, {})
        .then(() => {
          this.search()
        })
        .catch((error) => {
          console.error(error)
        });
    },

    openCombined(item) {
      this.summary = 0;
      this.combinedOurService = item.service_id;
      this.combinedMisServicesSelected = [];

      this.getAllPrices(item);

      this.showCombinedDialog = true;
    },

    resetValidation() {
      this.alert.show = false;
      this.$refs.form.resetValidation();
    },

    getAllPrices(item) {
      this.combinedLoading = true;

      axios.post(this.apiUrl + 'price/v1/multi/get_all_prices', {
        integration_id: item.integration_id,
        mis_clinic_id: item.mis_clinic_id,
      }, {})
        .then((response) => {
          this.misServices = response.data.services;

          item.combined_prices.forEach(price => {
            let index = this.misServices.findIndex(el => el.mis_service_id === price.mis_service_id);

            if (index !== -1) {
              let service = this.misServices[index];
              service.coefficient = 1;
              this.combinedMisServicesSelected.push(service);
            }
          });
          this.combinedLoading = false;
        }).catch((error) => {
          console.error(error);
      });
    },

    filterTextField($event) {
      if (!filterKeyboardNumbers($event.keyCode, true)) {
        $event.preventDefault();
      }
    },

    removeFromSelected(item) {
      this.combinedMisServicesSelected.forEach((el, index) => {
        if (el === item.id) {
          this.combinedMisServicesSelected.splice(index, 1);
        }
      });
    },

    addToSelected(item) {
      this.combinedMisServicesSelected.push(item);
    },

    removeChip(item, id) {
      item.np_workplaces.splice(item.np_workplaces.indexOf(id), 1)
    },

    openDoctorPage(item) {
      window.open(item.url, '_blank').focus;
    },

    saveCombined() {

    },
  },
}
</script>

<style scoped>
  .align-vertical {
    vertical-align: top;
  }

  .text-black {
    color: black;
  }

  .duplicate {
    border-left: 4px solid orange;
  }

  .duplicate-text {
    color: orange;
    font-weight: bold;
  }

  .outdated-price {
    background-color: #ef9a9a;
  }

  .vertical-separator {
    border-right: 1px solid dimgrey;
    height: 24px;
  }

  .danger-text {
    color: red;
  }

  .per-page-input {
    max-width: 100px;
  }

  .striked-through {
    text-decoration: line-through;
  }

  .text-input {
    max-width: 300px;
  }

  .text-14 {
    font-size: 14px;
  }

  .np-workplaces .v-chip {
    width: 100%!important;
  }

  .np-workplaces .v-chip__content {
    padding-left: 30px!important;
  }

  .np-workplaces .v-chip__close {
    position: absolute!important;
    left: 5px!important;
  }

  tr:nth-of-type(even) {
    background-color: rgb(237, 237, 237);
  }

  .z-index-110 {
    z-index: 110;
  }

  .sticky {
    position: sticky;
    top: 0;
    max-height: 60px;
    z-index: 2;
    background-color: #ffffff;
  }

  .excluded-pink-row {
    background-color: rgba(240, 128, 128, 0.5) !important;
  }

  .connected-green-row {
    background-color: rgba(0, 128, 0, 0.5) !important;
  }

  .connected-and-excluded-row {
    background-color: #e64a19 !important;
  }

  .bookmark {
    background-color: rgba(30, 13, 184, 0.5) !important;
  }

  /* для того, чтобы bookmark отображалась не наверху, а посередине экрана */
  .anchorSpan {
    margin-top: -500px !important;
    padding-bottom: 500px !important;
    display: block !important;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .service-picker {
    width: 250px;
  }

  .hoverable:hover {
    background-color: rgba(0,0,0,.05);
  }

  .duplicate td:first-child button:first-child {
    border-left: 5px solid orange;
  }

  .divider {
    margin: 0;
  }

  .status-icon {
    max-width: 15%;
  }

  .status-input {
    max-width: 85%;
    padding-left: 6px;
  }
</style>
