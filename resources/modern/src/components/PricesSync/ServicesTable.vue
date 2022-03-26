<template>
  <div>
    <v-data-table
      :headers="headers"
      :show-select="true"
      :items="connectedServices"
      :items-per-page="5"
      :footer-props="footerProps"
      :page="currentPage"
      @pagination="paginate"
      class="elevation-1 pt-2"
      :loading="loading"
      loading-text="Загрузка данных..."
    >
      <template v-slot:header.data-table-select="{}">
        <div style="display: inline-block">
          <v-simple-checkbox
              :value="selectedAll"
              :indeterminate="selectedAllIndeterminate"
              @click="MarkItemsSelected(connectedServices, !selectedAll && !selectedAllIndeterminate)"
          />
        </div>

        <v-menu
            offset-y
            open-on-hover
        >
          <template v-slot:activator="{ on, attrs }" >
            <v-icon
                size="32px"
                color="teal darken-2"
                v-bind="attrs"
                v-on="on"
            >
              mdi-menu
            </v-icon>
          </template>

          <v-list>
            <v-list-item>
              <v-list-item-title>
                <div>
                  <v-icon
                      @click="createItemsDuplicates(getSelectedItems(connectedServices))"
                      title="Дублировать"
                  >
                    mdi-playlist-plus
                  </v-icon>
                </div>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                <div class="d-flex flex-column">
                  <v-icon
                      @click="createItemsChilds(getSelectedItems(connectedServices))"
                      title="Создать детские"
                  >
                    mdi-baby-face-outline
                  </v-icon>
                </div>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                <div class="d-flex flex-column">
                  <v-icon
                      @click="setItemsReceptions(getSelectedItems(connectedServices))"
                      title="Сделать услуги приемами"
                  >
                    mdi-doctor
                  </v-icon>
                </div>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                <div class="d-flex flex-column">
                  <v-icon
                      @click="setItemsServices(getSelectedItems(connectedServices))"
                      title="Сделать приемы услугами"
                  >
                    mdi-needle
                  </v-icon>
                </div>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                <div class="d-flex flex-column">
                  <v-icon
                      @click="deleteItems(getSelectedItems(connectedServices))"
                      title="Удалить цены"
                  >
                    mdi-delete
                  </v-icon>
                </div>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <div style="display: inline-block">
          <v-icon
              v-if="!selectedExcludeAll"
              size="22px"
              @click="setItemsExcludeState(connectedServices, !selectedExcludeAll);selectedExcludeAll=!selectedExcludeAll"
              title="Вычеркнуть все"
          >
            mdi-content-cut
          </v-icon>
          <v-icon
              v-else
              size="22px"
              @click="setItemsExcludeState(connectedServices, !selectedExcludeAll);selectedExcludeAll=!selectedExcludeAll"
              title="Восстановить все"
          >
            mdi-restore
          </v-icon>
        </div>
      </template>

      <template v-slot:top>
          <v-row class="sticky">
            <v-col class="top-col">
              <v-text-field
                  v-if="filters.misServicesSearch !== ''"
                  v-model="filters.misServicesSearch"
                  label="Поиск по услугам в МИС"
                  append-icon="mdi-close"
                  @click:append="clearSearchInput"
                  @change="filterChanged()"
              ></v-text-field>
                <v-text-field
                    v-else
                    v-model="filters.misServicesSearch"
                    label="Поиск по услугам в МИС"
                    @change="filterChanged()"
                ></v-text-field>
            </v-col>

            <v-col class="top-col mt-3">
              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn @click="goToBookmark()"
                         class="mr-1"
                         color="primary"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         icon
                         text
                  >
                    <v-icon>
                      mdi-clippy
                    </v-icon>
                  </v-btn>
                </template>
                <span>К закладке</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-btn class="mr-1"
                         color="red darken-2"
                         @click="resetFilter()"
                         v-bind="attrs"
                         v-on="on"
                         elevation="0"
                         text
                         icon
                  >
                    <v-icon>
                      mdi-filter-remove-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Очистить фильтр</span>
              </v-tooltip>

              <v-menu
                  style="z-index: 110;"
                  :close-on-content-click="false"
                  offset-y
              >
                <template v-slot:activator="{ attrs, on }">
                  <v-btn
                      id="filters"
                      class="text-transform-none ml-3"
                      v-bind="attrs"
                      v-on="on"
                      elevation="0"
                      text
                  >
                    <v-icon left dark>
                      mdi-menu
                    </v-icon>

                    <span>Фильтры</span>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlySmartMatchingFlag"
                      />
                    </v-list-item-action>
                    <v-list-item-title>Только автоматически сопоставленные</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlyDuplicatesFlag"
                          @change="changeOnlyDuplicatesState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только дубли</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          @click=goTop(onlyCombinedFlag)
                          v-model="onlyCombinedFlag"
                          @change="changeOnlyCombinedState"
                      />
                    </v-list-item-action>
                    <v-list-item-title>Только комбинированные</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlyNotConnectedFlag"
                          @change="changeOnlyNotConnectedState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только вычеркнутые</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlyOldPricesFlag"
                          @change="changeOnlyOldPricesState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только устаревшие</v-list-item-title>
                  </v-list-item>


                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlyRepeatingPricesFlag"
                          @change="changeOnlyRepeatingPricesState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только повторяющиеся</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlyCreatedByUserFlag"
                          @change="changeOnlyCreatedByUserState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только ручные</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlyWithChildAnalogueFlag"
                          @change="changeOnlyWithChildAnalogueState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только с детским аналогом</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlyWithCommentForContentFlag"
                          @change="changeOnlyWithCommentForContentState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только с комментарием для контента</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="onlyBookmarksFlag"
                          @change="changeOnlyBookmarksState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только закладки</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                        v-model="onlyTemporaryFlag"
                        @change="changeOnlyTemporaryState"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Только временные</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                              v-model="showReceptionsFlag"
                      />
                    </v-list-item-action>

                  <v-list-item-title>Приемы</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                              v-model="showServicesFlag"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Услуги</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="showConnectedFlag"
                          @change="changeShowConnectedFlag"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Сопоставленные</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="showNotConnectedFlag"
                          @change="changeShowNotConnectedFlag"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Несопоставленные</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="showExcludedFlag"
                          @change="changeShowExcludedFlag"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Вычеркнутые</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="showCombinedFlag"
                          @change="changeShowCombinedFlag"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Комбинированные</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                          v-model="showMisServicesFlag"
                          @change="changeShowMisServicesFlag"
                      />
                    </v-list-item-action>

                    <v-list-item-title>Цены из МИС</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                        <v-switch
                            v-model="showFileServicesFlag"
                            @change="changeShowMisServicesFlag"
                        />
                    </v-list-item-action>

                    <v-list-item-title>Цены из файла</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

            </v-col>

            <v-col class="top-col mx-4">
              <v-text-field
                  v-if="filters.ourServicesSearch !== ''"
                  v-model="filters.ourServicesSearch"
                  label="Поиск по нашим услугам"
                  append-icon="mdi-close"
                  @click:append="clearSearchInput"
              ></v-text-field>
                <v-text-field
                    v-else
                    v-model="filters.ourServicesSearch"
                    label="Поиск по нашим услугам"
                ></v-text-field>
            </v-col>
          </v-row>
      </template>

      <template v-slot:item="{ item : rowItem }">
        <tr :class="{
          'duplicate': rowItem.duplicate,
          'excluded-pink-row': rowItem.excluded,
          'connected-green-row': rowItem.service_id || rowItem.np_workplaces.length && rowItem.is_reception,
          'connected-and-excluded-row': (rowItem.service_id || rowItem.np_workplaces.length && rowItem.is_reception) && rowItem.excluded
        }">

          <td class="pr-0 pl-1">
            <div style="display: inline-block">
              <v-simple-checkbox v-model="rowItem.selected" @click="updateSelectedFlag();autocompleteChanged(rowItem)"/>
            </div>

            <v-menu
                offset-y
                open-on-hover
            >
              <template v-slot:activator="{ on, attrs }" >
                <v-icon
                    v-if="(adultServices.indexOf(rowItem.service_id) === -1 && !rowItem.is_reception)"
                    size="32px"
                    color="teal darken-2"
                    v-bind="attrs"
                    v-on="on"
                >
                  mdi-menu
                </v-icon>

                <v-icon
                    v-else-if="rowItem.is_reception"
                    size="22px"
                    color="teal darken-2"
                    v-bind="attrs"
                    v-on="on"
                    title="Это прием!"
                >
                  mdi-doctor
                </v-icon>

                <v-icon
                    v-else-if="(adultServices.indexOf(rowItem.service_id) !== -1)"
                    color="teal darken-2"
                    v-bind="attrs"
                    v-on="on"
                >
                  mdi-baby-face-outline
                </v-icon>
              </template>

              <v-list>
                <v-list-item v-if="!rowItem.duplicate">
                  <v-list-item-title>
                      <div>
                        <v-icon
                            @click="duplicateClicked(rowItem)"
                            title="Дублировать"
                        >
                          mdi-playlist-plus
                        </v-icon>
                      </div>
                  </v-list-item-title>
                </v-list-item>

                <v-list-item v-if="adultServices.indexOf(rowItem.service_id) !== -1">
                  <v-list-item-title>
                      <div class="d-flex flex-column">
                        <v-icon
                            title="Создать детскую"
                            @click="addChildrenService(rowItem)"
                        >
                          mdi-baby-face-outline
                        </v-icon>
                      </div>
                  </v-list-item-title>
                </v-list-item>

                <v-list-item v-if="!rowItem.is_reception && !rowItem.is_combined">
                  <v-list-item-title>
                    <div class="d-flex flex-column">
                      <v-icon
                              @click="changeToReception(rowItem)"
                              title="Сделать услугу приемом"
                      >
                        mdi-doctor
                      </v-icon>
                    </div>
                  </v-list-item-title>
                </v-list-item>

                <v-list-item v-if="rowItem.is_reception && !rowItem.is_combined">
                  <v-list-item-title>
                    <div class="d-flex flex-column">
                      <v-icon
                          @click="changeToService(rowItem)"
                          title="Сделать прием услугой"
                      >
                        mdi-needle
                      </v-icon>
                    </div>
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>
                    <div class="d-flex flex-column">
                      <v-icon
                          @click="deleteClicked(rowItem)"
                          title="Удалить цену"
                      >
                        mdi-delete
                      </v-icon>
                    </div>
                  </v-list-item-title>
                </v-list-item>

                <v-list-item v-if="!rowItem.is_combined">
                  <v-list-item-title>
                    <div  class="d-flex flex-column">
                      <v-icon
                          @click="openCombinedPriceDialog(0, rowItem)"
                          title="Создать комбинированную цену c этой услугой"
                      >
                        mdi-animation
                      </v-icon>
                    </div>
                  </v-list-item-title>
                </v-list-item>
             </v-list>
            </v-menu>

            <span v-if="rowItem.duplicate">дубль</span>

            <div style="display: inline-block">
              <v-icon
                  v-if="rowItem.excluded"
                  color="teal darken-1"
                  size="22px"
                  @click="rowItem.excluded = !rowItem.excluded; autocompleteChanged(rowItem)"
                  title="Восстановить"
              >
                mdi-restore
              </v-icon>
              <v-icon
                  v-else
                  size="22px"
                  @click="rowItem.excluded = !rowItem.excluded; autocompleteChanged(rowItem)"
                  title="Вычеркнуть"
              >
                mdi-content-cut
              </v-icon>
            </div>
          </td>

          <td v-if="hasField('mis_service_id')">
            <div v-if="rowItem.is_combined">
              <p v-for="combinedPrice in rowItem.combinedPrices" :key="combinedPrice.id">
                {{ combinedPrice.mis_service_id }}
              </p>
            </div>
            <span v-else>
              {{ rowItem.mis_service_id }}
            </span>
          </td>

          <td
              v-if="hasField('mis_service_name')"
              :class="{bookmark: rowItem.bookmark}"
              @dblclick="refreshBookmarksList(rowItem), $set(rowItem, 'bookmark', !rowItem.bookmark)">
            <div v-if="rowItem.is_combined" class="service-name">
              <p v-for="combinedPrice in rowItem.combinedPrices" :key="combinedPrice.id">
                {{ combinedPrice.mis_service_name }}
              </p>
            </div>
            <span v-else class="service-name">
              {{ rowItem.mis_service_name }}
            </span>

            <span v-if="rowItem.bookmark" v-bind:id="rowItem.anchorId" class="anchorSpan"></span>
          </td>

          <td
            v-if="hasField('price')"
            class="max-width-100"
          >
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
            <input
              v-if="rowItem.imported || rowItem.is_created_by_user"
              v-model="rowItem.price"
              class="status-input"
            >
            <span v-else class="status-input">
              {{ rowItem.price }}
            </span>
          </td>

          <td
              v-if="hasField('comment')"
              class="comment"
              @click="toggleCommentEditableState(rowItem, true)"
          >
            <p v-if="!getCommentEditableState(rowItem)">
              {{ rowItem.comment }}
            </p>
            <v-textarea class="font14"
                        v-else
                        @click="autocompleteChanged(rowItem)"
                        auto-grow
                        v-model="rowItem.comment"
                        aria-expanded="true"
                        rows="2"
                        :disabled="rowItem.excluded"
                        counter
            />
          </td>

          <td
              v-if="hasField('service_name_reception')"
              class="service_name_reception"
              @click="toggleReceptionNameEditableState(rowItem, true);autocompleteChanged(rowItem);">
            <span v-if="!getReceptionNameEditableState(rowItem)">
              {{ rowItem.service_name_reception }}
            </span>
            <v-combobox class="z-index-110"
                            v-else
                            v-model="rowItem.service_name_reception"
                            :items="getWorkpalcesSpecialitiesAutocomplete(rowItem)"
                            @blur="toggleAutocomplete(rowItem, false)"
                            @click:clear="autocompleteChanged(rowItem, false)"
                            @change="autocompleteChanged(rowItem)"
                            label="Название приема"
            />
          </td>

          <td v-if="!rowItem.is_reception && hasField('service_id')"
              @click="toggleAutocomplete(rowItem, true)"
              @change="autocompleteChanged(rowItem)"
              class="hoverable cursor-pointer service-picker"
              :title="getServiceTitle(rowItem)"
          >
            <div
              v-if="!rowItem.autocomplete_visible && !rowItem.is_combined"
              class="d-flex"
            >
              <span
                v-if="rowItem.service_name"
              >
                {{ rowItem.is_smart_matching ? rowItem.service_name.replace(/\[\d+\]/, '') : rowItem.service_name }}
              </span>

              <v-icon
                  v-if="rowItem.service_name === null || !rowItem.is_smart_matching || rowItem.service_name === ''"
                  :disabled="rowItem.excluded"
              >
                mdi-pen
              </v-icon>
              <v-icon
                  v-else
                  :disabled="rowItem.excluded"
              >
                mdi-cog-outline
              </v-icon>
            </div>

            <div v-if="rowItem.is_combined" class="d-flex align-center">
              <span class="mr-2">
                {{ rowItem.service_name }}
              </span>

              <div v-if="!rowItem.is_new_duplicate">
                <v-tooltip bottom>
                  <template v-slot:activator="{on, attrs}">
                    <v-btn
                        v-on="on"
                        v-bind="attrs"
                        @click="openCombinedPriceDialog(rowItem.id)"
                        elevation="0"
                        text
                        icon
                    >
                      <v-icon>
                        mdi-animation
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Редактировать комбинированную цену</span>
                </v-tooltip>
              </div>
            </div>

            <v-autocomplete class="z-index-110"
              v-else-if="rowItem.autocomplete_visible"
              v-model="rowItem.service_id"
              :items="ourServices"
              @blur="toggleAutocomplete(rowItem, false)"
              @click:clear="toggleAutocomplete(rowItem, false)"
              @change="autocompleteChanged(rowItem)"
              label="Наша услуга"
              item-text="name"
              item-value="id"
              small-chips
              hide-no-data
              clearable
              autofocus
            />
          </td>

          <td v-else-if="hasField('service_id')"
              :colspan="hasField('service_name_reception') ? 1 : 3"
              @click="toggleAutocomplete(rowItem, true)"
              @change="autocompleteChanged(rowItem)"
              class="hoverable cursor-pointer service-picker"
          >
            <div
                v-if="!rowItem.autocomplete_visible && !rowItem.is_combined"
                class="d-flex"
            >

              <v-icon
                  v-if="!rowItem.is_smart_matching"
                  :disabled="rowItem.excluded"
              >
                mdi-pen
              </v-icon>
              <v-icon
                  v-else
                  :disabled="rowItem.excluded"
              >
                mdi-cog-outline
              </v-icon>

              <span v-if="rowItem.np_workplaces.length">
                <div
                    v-for="workplace in getCurrentSelectedWorkplaces(rowItem)"
                    v-bind:key="rowItem.id + '_' + workplace.id"
                >
                  {{ rowItem.is_smart_matching ? `${workplace.name} — (${rowItem.smart_name})` : workplace.display_name }},
                </div>
              </span>


            </div>

            <v-autocomplete class="z-index-110 np-workplaces"
                            v-else-if="rowItem.autocomplete_visible"
                            :items="workplaces"
                            v-model="rowItem.np_workplaces"
                            @click:clear="toggleAutocomplete(rowItem, false)"
                            label="Список Врачей"
                            item-text="display_name"
                            item-value="id"
                            small-chips
                            hide-no-data
                            clearable
                            multiple
                            deletable-chips
            >
              <template v-slot:selection="{ attrs, item }">
                <v-chip
                  small
                  v-bind="attrs"
                  :input-value="item.display_name"
                  close
                  @click="openDoctorPage(item)"
                  @click:close="removeChip(rowItem, item.id)"
                >
                  {{ item.display_name }}
                </v-chip>
              </template>
            </v-autocomplete>
          </td>

          <td v-if="!rowItem.is_reception && hasField('is_min_price')">
            <v-simple-checkbox
              @click="autocompleteChanged(rowItem)"
              v-model="rowItem.is_min_price"
              :disabled="rowItem.excluded || rowItem.is_reception"
              v-ripple
            />
          </td>

          <td>
            <div>
              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <div
                    v-bind="attrs"
                    v-on="on"
                    @click="openServiceCommentDialog(rowItem)"
                  >
                    <span v-if="!rowItem.service_comment">
                      ...
                    </span>
                    <v-icon v-else>
                      mdi-weather-cloudy-alert
                    </v-icon>
                  </div>
                </template>
                <span>
                  комментарий к услуге
                </span>
              </v-tooltip>
            </div>
          </td>

          <td
              v-if="!rowItem.is_reception && hasField('excluded_service_ids')"
              @click="autoExcludedServiceIds(rowItem), autocompleteChanged(rowItem)"
              @dblclick="toggleMultiselect(rowItem, true)"
              class="hoverable cursor-pointer service-picker"
              title="Выбрать дополнительные услуги"
          >
            <div
              v-if="!rowItem.multiselect_visible"
              class="d-flex"
            >
              <span
                v-if="rowItem.excluded_service_ids.length"
                class="mr-2"
              >
                <span v-for="service in getServicesByIds(rowItem.excluded_service_ids)" :key="service.id">
                  {{ service.name }}
                  <br>
                </span>
              </span>

              <v-icon
                :disabled="rowItem.excluded"
              >
                mdi-pen
              </v-icon>
            </div>

            <v-autocomplete
              v-if="rowItem.multiselect_visible"
              class="multiselect"
              v-model="rowItem.excluded_service_ids"
              :items="ourServices"
              @blur="toggleMultiselect(rowItem, false)"
              @click:clear="toggleMultiselect(rowItem, false)"
              label="Доп. услуги"
              item-text="name"
              item-value="id"
              :disabled="rowItem.excluded || rowItem.is_reception"
              counter
              deletable-chips
              clearable
              small-chips
              multiple
              autofocus
            />
          </td>

          <td v-if="rowItem.temporary_excluded_type === 'auto_discard'">
            <div>
              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <div
                    v-bind="attrs"
                    v-on="on"
                    @click="openTemporaryExcludeDialog(rowItem)"
                  >
                    <v-icon>
                      mdi-refresh-auto
                    </v-icon>
                  </div>
                </template>
                <span>
                  уберет вычеркивание: {{ rowItem.temporary_excluded_until }}
                </span>
              </v-tooltip>
            </div>
          </td>

          <td v-else-if="rowItem.temporary_excluded_type === 'notify'">
            <div>
              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <div
                    v-bind="attrs"
                    v-on="on"
                    @click="openTemporaryExcludeDialog(rowItem)"
                  >
                    <v-icon>
                      mdi-email-sync
                    </v-icon>
                  </div>
                </template>
                <span>
                  оповещение о вычеркивании: {{ rowItem.temporary_excluded_until }}
                </span>
              </v-tooltip>
            </div>
          </td>

          <td v-else>
            <div>
              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <div
                    v-bind="attrs"
                    v-on="on"
                    @click="openTemporaryExcludeDialog(rowItem)"
                  >
                    <v-icon>
                      mdi-alarm
                    </v-icon>
                  </div>
                </template>
                <span>временно вычеркнуть</span>
              </v-tooltip>
            </div>
          </td>

          <td v-if="hasField('is_updating')">
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
                      @click="rowItem.is_updating = !rowItem.is_updating"
                      :value="!rowItem.is_updating"
                      v-ripple
                      v-on="on"
                      v-bind="attrs"
                      color="red darken-3"
                  />
                </template>
                <span>{{ rowItem.updated_time }}</span>
              </v-tooltip>
            </div>
          </td>

        </tr>
      </template>
    </v-data-table>

    <v-dialog v-model="temporaryExcludeServiceModalVisible"
              max-width="600"
              @keydown.esc="temporaryExcludeServiceModalVisible = false"
    >
      <TemporaryExcludeServiceModal
        @close-modal="closeModal"
        :service-for-exclude="this.serviceForExclude"
      />
    </v-dialog>

    <v-dialog v-model="serviceCommentModalVisible"
              max-width="600"
              @keydown.esc="serviceCommentModalVisible = false"
    >
      <CommentForService
        @close-modal="closeModal"
        :service-for-comment="this.serviceForComment"
      />
    </v-dialog>

    <Footer @save-clicked="saveAll"
            :services="connectedServices"
            :integration-id="integrationId"
            :mis-clinic-id="misClinicId"
            :matched="matched"
            :loading="loading"
    />
  </div>
</template>

<script>
  import _ from 'lodash';
  import {escapeRegExp} from '@/helpers';
  import TemporaryExcludeServiceModal from './TemporaryExcludeServiceModal';
  import CommentForService from './CommentForService';
  import Footer from './Footer';

  export default {
    name: "ServicesTable",
    components: { Footer, TemporaryExcludeServiceModal, CommentForService },

    props: {
      loading: {
        type: Boolean,
        default: false,
      },

      integrationId: {
        type: Number,
        default: 0,
      },

      misClinicId: {
        type: String,
        default: '',
      },

      value: {
        type: Array,
        default: () => [],
      },

      excludedTypes: {
        type: Array,
        default: () => [],
      },

      ourServices: {
        type: Array,
        default: () => [],
      },

      workplaces: {
        type: Array,
        default: () => [],
      },

      adultServices: {
        type: Array,
        default: () => [],
      },

      childrenServices: {
        type: Array,
        default: () => [],
      },

      onlyDuplicates: {
        type: Boolean,
        default: false,
      },

      onlyCombined: {
        type: Boolean,
        default: false,
      },

      onlyNotConnected: {
        type: Boolean,
        default: false,
      },

      onlyOldPrices: {
        type: Boolean,
        default: false,
      },

      onlyRepeatingPrices: {
        type: Boolean,
        default: false,
      },

      repeatingConnectedServicesId: {
        type: Array,
        default: () => [],
      },

      onlyCreatedByUser: {
        type: Boolean,
        default: false,
      },

      onlyWithChildAnalogue: {
        type: Boolean,
        default: false,
      },

      onlyWithCommentForContent: {
        type: Boolean,
        default: false,
      },

      onlyTemporary: {
        type: Boolean,
        default: false,
      },

      onlyBookmarks: {
        type: Boolean,
        default: false,
      },

      showConnected: {
        type: Boolean,
        default: true,
      },

      showNotConnected: {
        type: Boolean,
        default: true,
      },

      showExcluded: {
        type: Boolean,
        default: true,
      },

      showCombined: {
        type: Boolean,
        default: true,
      },

      bookmark: {
        type: Boolean,
        default: false,
      }
    },

    data: () => ({
      headersServices: [
        {text: 'ID в МИС', value: 'mis_service_id'},
        {text: 'Название услуги в МИС', value: 'mis_service_name', width: 300},
        {text: 'Цена', value: 'price', width: 80},
        {text: 'Комментарий', value: 'comment'},
        {text: 'Наша услуга/врач', value: 'service_id', width: 300},
        {text: 'Цена от?', value: 'is_min_price', width: 80},
        {text: 'Коммент к услуге', value: 'service_comment', width: 60},
        {text: 'Доп. услуги', value: 'excluded_service_ids'},
        {text: 'Временно вычеркнута', value: 'temporary_excluded', width: 60},
        {text: 'Устарела?', value: 'is_updating', width: 60},
      ],
      headersReceptions: [
        {text: 'ID в МИС', value: 'mis_service_id'},
        {text: 'Название услуги в МИС', value: 'mis_service_name', width: 300},
        {text: 'Цена', value: 'price', width: 80},
        {text: 'Наименование приема', value: 'service_name_reception'},
        {text: 'Наши врачи', value: 'service_id', width: 800},
        {text: 'Коммент к услуге', value: 'service_comment', width: 60},
        {text: 'Временно вычеркнута', value: 'temporary_excluded', width: 60},
        {text: 'Устарела?', value: 'is_updating', width: 80},
      ],

      selectedList: [],
      bookMarkList: [],
      anchorCounter: 0,

      selectedAllIndeterminate: false,
      selectedAll: false,
      selectedExcludeAll: false,
      temporaryExcludeServiceModalVisible: false,
      serviceCommentModalVisible: false,
      serviceForExclude: {},
      serviceForComment: {},

      filters: {
        ourServicesSearch: '',
        misServicesSearch: '',
      },

      currentPage: 1,
      beforeSearchPage: 1,

      footerProps: {
        'items-per-page-options': [10, 50, 100, 500, -1],
        'items-per-page-text': 'Строк на странице:',
        'page-text': '{0}-{1} из {2}',
      },

      onlySmartMatchingFlag: false,
      onlyDuplicatesFlag: false,
      onlyCombinedFlag: false,
      onlyNotConnectedFlag: false,
      onlyOldPricesFlag: false,
      onlyRepeatingPricesFlag: false,
      onlyCreatedByUserFlag: false,
      onlyWithChildAnalogueFlag: false,
      onlyWithCommentForContentFlag: false,
      onlyTemporaryFlag: false,
      onlyBookmarksFlag: false,
      showServicesFlag: true,
      showReceptionsFlag: true,
      showConnectedFlag: true,
      showNotConnectedFlag: true,
      showExcludedFlag: true,
      showCombinedFlag: true,
      showMisServicesFlag: true,
      showFileServicesFlag: true,
    }),

    watch: {
      searchValues: {
        handler(val) {
          if (val) {
            this.currentPage = 1;
          } else {
            this.currentPage = this.beforeSearchPage;
          }
        }
      }
    },

    created() {
      // Переопределяем комбинацию клавиш Ctrl+S
      document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyS' && e.ctrlKey) {
          e.preventDefault();

          this.saveAll();
        }
      });
    },

    computed: {
      headers() {
        return this.showReceptionsFlag && !this.showServicesFlag ? this.headersReceptions : this.headersServices;
      },

      matched() {
        let matched = this.value.filter(price => {
          return !price.excluded && (!price.is_reception && price.service_id || price.is_reception && price.np_workplaces.length);
        }).length;

        return "Сопоставлено: " + matched;
      },

      connectedServices: {
        get() {
          let misServicesSearch = escapeRegExp(this.filters.misServicesSearch);
          let ourServicesSearch = escapeRegExp(this.filters.ourServicesSearch);

          let regMisServices      = new RegExp(misServicesSearch, 'i');
          let regOurServices      = new RegExp(ourServicesSearch, 'i');
          let regOurNpWorkplaces  = new RegExp(ourServicesSearch, 'i');
          let regPrice            = new RegExp(/\d+/);

          return this.value.filter((item) => {
            let showReceptions            = true;
            let showServices              = true;
            let showCombined              = true;
            let showExcluded              = true;
            let duplicate                 = true;
            let combined                  = true;
            let misServices               = true;
            let fileServices              = true;
            let misServiceNameMatch       = true;
            let ourServiceNameMatch       = true;
            let onlyOldPrices             = true;
            let onlyRepeatingPrices       = true;
            let onlyCreatedByUser         = true;
            let onlyNotConnected          = true;
            let onlyWithChildAnalogue     = true;
            let onlyWithCommentForContent = true;
            let onlyTemporary             = true;
            let onlySmartMatching         = true;
            let onlyBookmarks             = true;

            if (this.onlyDuplicates) {
              duplicate = item.duplicate;
            }

            if (this.onlyCombined) {
              combined = item.is_combined;
            }

            if (this.showMisServicesFlag) {
              misServices = !item.imported;
            }

            if (this.showFileServicesFlag) {
              fileServices = item.imported;
            }

            if (this.showMisServicesFlag && this.showFileServicesFlag) {
              misServices = fileServices = misServices || fileServices;
            }

            if (this.onlyNotConnected) {
              onlyNotConnected = item.excluded;
            }

            if (this.onlyOldPrices) {
              onlyOldPrices = !item.is_updating;
            }

            if (this.onlyRepeatingPrices) {
              onlyRepeatingPrices = this.repeatingConnectedServicesId.indexOf(item.service_id) !== -1;
            }

            if (this.onlyCreatedByUser) {
              onlyCreatedByUser = item.is_created_by_user;
            }

            if (this.onlyWithChildAnalogue) {
              const hasServiceId = !!item.service_id;

              const isPriceWithChildAnalogue = hasServiceId && this.adultServices.indexOf(item.service_id) !== -1;
              const isChildPrice = hasServiceId && this.childrenServices.find((service) => service.children_service_id === item.service_id)
              const isDuplicateWithChildAnalogue = item.duplicate && isChildPrice;

              onlyWithChildAnalogue = isPriceWithChildAnalogue || isDuplicateWithChildAnalogue;
            }

            if (this.onlyWithCommentForContent) {
              onlyWithCommentForContent = !!item.comment_for_content;
            }

            if (this.onlyTemporary) {
              onlyTemporary = !!item.temporary_excluded_until;
            }

            if (this.onlySmartMatchingFlag) {
              onlySmartMatching = item.is_smart_matching;
            }

            if (this.onlyBookmarks) {
              onlyBookmarks = !!item.bookmark;
            }

            if (this.showServicesFlag) {
              showServices = !item.is_reception;
            }
            if (this.showReceptionsFlag) {
              showReceptions = !!item.is_reception;
            }
            if (this.showReceptionsFlag && this.showServicesFlag) {
              showReceptions = showServices = showServices || showReceptions;
            }

            if (!this.showExcluded) {
              showExcluded = !item.excluded;
            }

            if (!this.showCombined) {
              showCombined = !item.is_combined;
            }

            if (misServicesSearch) {
              if (item.is_combined) {
                let matchesCount = 0;

                Object.keys(item.combinedPrices).map((index) => {
                  let misServiceNameWithLongSpaces = item.combinedPrices[index].mis_service_name;
                  let misServiceNameWithoutLongSpaces = misServiceNameWithLongSpaces.replace(/\s+/g, ' ')
                  misServiceNameMatch = regMisServices.test(misServiceNameWithoutLongSpaces) ||
                      (
                          regPrice.test(item.combinedPrices[index].price) &&
                          item.combinedPrices[index].price == this.filters.misServicesSearch
                      );

                  if (misServiceNameMatch) {
                    matchesCount++
                  }
                });

                misServiceNameMatch = matchesCount > 0;
              } else {
                let misServiceNameWithLongSpaces = item.mis_service_name;
                let misServiceNameWithoutLongSpaces = misServiceNameWithLongSpaces.replace(/\s+/g, ' ')
                misServiceNameMatch = regMisServices.test(misServiceNameWithoutLongSpaces) ||
                    (
                        regPrice.test(item.price) &&
                        item.price == this.filters.misServicesSearch
                    );
              }
            }

            if (ourServicesSearch) {
              if (!item.is_reception) {
                ourServiceNameMatch = regOurServices.test(item.service_name) ||
                    (
                        regPrice.test(item.price) &&
                        item.price == this.filters.ourServicesSearch
                    );
              } else {
                let workplaces = this.getCurrentSelectedWorkplaces(item);

                ourServiceNameMatch = false;

                workplaces.forEach((workplace) => {
                  ourServiceNameMatch |= regOurNpWorkplaces.test(workplace.name) ||
                      regOurNpWorkplaces.test(workplace.id);
                })
              }
            }



            let base = ourServiceNameMatch
                && misServiceNameMatch;

            let dlc = showCombined
                && combined
                && duplicate
                && showServices
                && showReceptions
                && showExcluded
                && misServices
                && fileServices;

            if (!this.showConnected && !this.showNotConnected) {
              // pass
            } else if (!this.showConnected) {
              dlc = dlc && !item.service_id && !item.np_workplaces.length;
            } else if (!this.showNotConnected) {
              if (item.duplicate === 1) {
                dlc = dlc && !item.service_id && !item.np_workplaces.length;
              } else {
                dlc = dlc && !(!item.service_id && !item.np_workplaces.length);
              }
            }

            if (this.onlyDuplicates) {
              base = base && duplicate;
            }
            if (this.onlyCombined) {
              base = base && combined;
            }
            if (this.onlyOldPrices) {
              base = base && onlyOldPrices;
            }
            if (this.onlyRepeatingPrices) {
              base = base && onlyRepeatingPrices;
            }
            if (this.onlyCreatedByUser) {
              base = base && onlyCreatedByUser;
            }
            if (this.onlyNotConnected) {
              base = base && onlyNotConnected;
            }
            if (this.onlyWithChildAnalogue) {
              base = base && onlyWithChildAnalogue;
            }
            if (this.onlyWithCommentForContent) {
              base = base && onlyWithCommentForContent;
            }

            if (this.onlyTemporary) {
              base = base && onlyTemporary;
            }

            if (this.onlySmartMatchingFlag) {
              base = base && onlySmartMatching;
            }

            if (this.onlyBookmarks) {
              base = base && onlyBookmarks;
            }

            return base && dlc;
          });
        },

        set(value) {
          this.$emit('input', value);
        },
      },

      searchValues() {
        return this.filters.misServicesSearch.length > 0 ||
            this.filters.ourServicesSearch.length > 0
      },
    },

    methods: {
      closeModal() {
        this.temporaryExcludeServiceModalVisible = false;
        this.serviceCommentModalVisible = false;
      },

      refreshBookmarksList(item) {
        let key = this.bookMarkList.indexOf(item)
        if (key === -1) {
          item.anchorId = item.id + 'anchor';
          this.bookMarkList.push(item);
        } else {
          this.bookMarkList.splice(key, 1);
        }
      },

        clearSearchInput() {
          if (this.filters.misServicesSearch !== '') {
              this.filters.misServicesSearch = '';
          }
          if (this.filters.ourServicesSearch !== '') {
              this.filters.ourServicesSearch = '';
          }
        },

      goToBookmark() {
        if (this.anchorCounter >= this.bookMarkList.length) {
          this.anchorCounter = 0;
        }

        document.location.href = '#' + this.bookMarkList[this.anchorCounter].anchorId;

        if (this.anchorCounter < this.bookMarkList.length) {
          this.anchorCounter += 1;
        } else {
          this.anchorCounter = 0;
        }
      },

      resetFilter() {
        this.filterChanged();
        this.$emit('reset-filter');
        this.procFilter(true);
      },

      procFilter(reset) {
        this.onlySmartMatchingFlag         = false;
        this.onlyDuplicatesFlag            = false;
        this.onlyCombinedFlag              = false;
        this.onlyNotConnectedFlag          = false;
        this.onlyOldPricesFlag             = false;
        this.onlyRepeatingPricesFlag       = false;
        this.onlyCreatedByUserFlag         = false;
        this.onlyWithChildAnalogueFlag     = false;
        this.onlyWithCommentForContentFlag = false;
        this.onlyTemporaryFlag             = false;
        this.onlyBookmarksFlag             = false;
        this.showServicesFlag              = reset;
        this.showReceptionsFlag            = reset;
        this.showConnectedFlag             = reset;
        this.showNotConnectedFlag          = reset;
        this.showExcludedFlag              = reset;
        this.showCombinedFlag              = reset;
        this.showMisServicesFlag           = reset;
        this.showFileServicesFlag          = reset;
      },

      hasField(field) {
        return this.headers.find(header => header.value === field);
      },

      getCurrentSelectedWorkplaces(item) {
        let workplaces = [];

        item.np_workplaces.forEach((workplaceId) => {
          if (item.is_reception) {
            if (workplaceId != null && typeof workplaceId == 'number') {
              let workplace = this.workplaces.find(x => x.id === workplaceId);

              if (workplace) {
                workplaces.push(workplace);
              }
            }
          }
        });

        return workplaces;
      },

      openDoctorPage(item) {
        window.open(item.url, '_blank').focus;
      },

      removeChip(item, id) {
        item.np_workplaces.splice(item.np_workplaces.indexOf(id), 1)
      },

      getWorkpalcesSpecialitiesAutocomplete(item) {
        let specialities = [];

        let workplaces = this.getCurrentSelectedWorkplaces(item);

        workplaces.forEach((workplace) => {
          workplace.specialities
            .split(', ')
            .forEach((speciality) => {
              let specialitity_in_multiple = speciality.split('-').map((speciality_single) => {
                return speciality_single + 'а';
              }).join('-');
              specialities.push('Прием ' + specialitity_in_multiple);
            })
        });

        return specialities;
      },

      filterChanged() {
        this.selectedExcludeAll = false;
        this.MarkItemsSelected(this.value, false);
      },

      saveAll() {
        this.$emit('save-clicked');
      },

      changeOnlyDuplicatesState() {
        this.filterChanged();
        this.$emit('only-duplicates-changed');
      },

      goTop(state) {
        if (state) {
          document.getElementById("filters").click();
          window.scrollTo(pageXOffset, 0);
        }
      },

      changeOnlyCombinedState() {
        this.filterChanged();
        this.$emit('only-combined-changed');
      },

      changeOnlyNotConnectedState() {
        this.filterChanged();
        this.$emit('only-not-connected-changed');
      },

      changeOnlyOldPricesState() {
        this.filterChanged();
        this.$emit('only-old-prices-changed');
      },

      changeOnlyRepeatingPricesState() {
        this.filterChanged();
        this.$emit('only-repeating-prices-changed');
      },

      changeOnlyCreatedByUserState() {
        this.filterChanged();
        this.$emit('only-created-by-user-changed');
      },

      changeOnlyWithChildAnalogueState() {
        this.filterChanged();
        this.$emit('only-with-child-analogue-changed');
      },

      changeOnlyWithCommentForContentState() {
        this.filterChanged();
        this.$emit('only-with-comment-for-content-changed');
      },

      changeOnlyTemporaryState() {
        this.filterChanged();
        this.$emit('only-temporary-changed');
      },

      changeOnlyBookmarksState() {
        this.filterChanged();
        this.$emit('only-bookmarks-changed');
      },

      changeShowConnectedFlag() {
        this.filterChanged();
        this.$emit('show-connected-changed');
      },

      changeShowNotConnectedFlag() {
        this.filterChanged();
        this.$emit('show-not-connected-changed');
      },

      changeShowExcludedFlag() {
        this.filterChanged();
        this.$emit('show-excluded-changed');
      },

      changeShowCombinedFlag() {
        this.filterChanged();
        this.$emit('show-combined-changed');
      },

      changeShowMisServicesFlag() {
          this.filterChanged();
          this.$emit('show-mis-changed');
      },

      changeShowFileServerFlag() {
          this.filterChanged();
          this.$emit('show-file-changed');
      },

      autoExcludedServiceIds(item) {
          this.excludedTypes.forEach((excluded) => {
              if (item.service_id === excluded.service_id) {
                  let value = excluded.excluded_services_ids.split(', ');
                  value.forEach((val) => {
                      val = parseInt(val, 10);
                      if (item.excluded_service_ids.indexOf(val) === -1) {
                          item.excluded_service_ids.push(val);
                      }
                  });
              }
          })
      },

      setItemsExcludeState(items, state) {
        items.forEach((item) => {
          item.excluded = state;
        });
      },

      updateSelectedFlag()
      {
        let selectedLength = this.getSelectedItems(this.connectedServices).length;

        this.selectedAllIndeterminate = false;
        this.selectedAll = false;

        if (selectedLength === 0) {
          this.selectedAll = false;
        } else if (selectedLength === this.connectedServices.length) {
          this.selectedAll = true;
        } else {
          this.selectedAllIndeterminate = true;
        }
      },

      MarkItemsSelected(items, state) {
        items.forEach((item) => {
          item.selected = state;
        });

        this.updateSelectedFlag();
      },

      getSelectedItems(items) {
        if (!items || (!items.length > 0)) {
          return [];
        }

        return items.filter((item) => {
          return !!item.selected;
        })
      },

      deleteItems(items) {
        this.$emit('delete-clicked-many', items);
      },

      setItemsServices(items) {
        items.forEach((item) => {
          if (item.is_reception && !item.is_combined) {
            this.changeToService(item);
          }
        });
      },

      setItemsReceptions(items) {
        items.forEach((item) => {
          if (!item.is_reception && !item.is_combined) {
            this.changeToReception(item);
          }
        });
      },

      createItemsChilds(items) {
        items.forEach((item) => {
          if (this.adultServices.indexOf(item.service_id) !== -1) {
            this.addChildrenService(item);
          }
        });
      },

      createItemsDuplicates(items) {
        items.forEach((item) => {
          if (!item.duplicate) {
            this.duplicateClicked(item);
          }
        });
      },

      excludeThis(value) {
        this.$emit('exclude-this', value);
      },

      returnFromExclude(value) {
        this.$emit('return-from-exclude', value);
      },

      addChildrenService(item) {
        let clone = _.clone(item);
        this.$emit('add-children-service', clone);
      },

      autocompleteChanged(item) {
        this.setAdditionalData(item);
      },

      toggleReceptionNameEditableState(item, state) {
        item.reception_name_editable = state;
      },

      getReceptionNameEditableState(item) {
        if (typeof item.reception_name_editable == 'undefined') {
          return false;
        } else {
          return item.reception_name_editable === true;
        }
      },

      toggleCommentEditableState(item, state) {
        item.comment_editable = state;
      },

      getCommentEditableState(item) {
        if (typeof item.comment_editable == 'undefined') {
          return false;
        } else {
          return item.comment_editable === true;
        }
      },

      setAdditionalData(item) {
        let ourService = this.ourServices.find((service) => {
          return service.id === item.service_id;
        });

        item.categories = ourService?.categories || [];
        item.service_name = ourService?.name || '';
        item.is_smart_matching = false;
        item.comment_for_content = ourService?.comment;
      },

      getServicesByIds(ids) {
        let names = [];

        this.ourServices.forEach(function (service) {
          if (ids.includes(service.id)) {
            names.push(service);
          }
        })

        return names;
      },

      duplicateClicked(item) {
        let clone = _.clone(item);
        this.$emit('duplicate-clicked', clone);
        if (item.is_combined) {
          this.$emit('save-clicked');
          this.$emit('reload-mis-data');
        }
      },

      deleteClicked(item) {
        this.$emit('delete-clicked', item);
      },

      changeToReception(item) {
        item.is_reception = true;
        item.excluded_service_ids = null;
        item.excluded = 0;
        item.is_min_price = 0;
        item.service_id = null;
        item.service_name = null;
        item.categories = null;
        item.original_price_id = null;
        item.np_workplaces = [];
      },

      changeToService(item) {
        item.is_reception = false;
        item.excluded_service_ids = [];
        item.excluded = 0;
        item.is_min_price = 0;
        item.service_id = null;
        item.service_name = null;
        item.categories = null;
        item.original_price_id = null;
        item.np_workplaces = [];
      },

      toggleAutocomplete(item, state) {
        if (!item.excluded) {
          item.autocomplete_visible = state;
        }
      },

      toggleMultiselect(item, state) {
        if (!item.excluded) {
          item.multiselect_visible = state;
        }
      },

      duplicateClass(item) {
        return {
          duplicate: item.duplicate,
        };
      },

      paginate(event) {
        if (!this.searchValues) {
          this.beforeSearchPage = event.page;
        }
      },

      openCombinedPriceDialog(id, item) {
        this.$emit('open-combined-price-dialog', id, item);
      },

      getServiceTitle(item) {
        if (item.comment_for_content !== null) {
          return item.comment_for_content;
        }

        if (item.is_combined) {
          return '';
        }

        return 'Выбрать нашу услугу';
      },

      openTemporaryExcludeDialog(service) {
        this.serviceForExclude = service;
        this.temporaryExcludeServiceModalVisible = true;
      },

      openServiceCommentDialog(service) {
        this.serviceForComment = service;
        this.serviceCommentModalVisible = true;
      },
    },
  }
</script>

<style>
  .top-col {
    padding: 0 12px !important;
  }

  .text-start:first-child {
    width: 90px!important;
  }

  .service-name {
    max-height: 100px;
    overflow-y: auto;
    display: block;
    margin: 5px 0;
  }

  .comment {
    min-width: 100px!important;
  }

  textarea {
    width: 180px!important;
  }

  td {
    padding: 0 6px!important;
  }

  th.text-start {
    padding: 0 3px!important;
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

  .font14 {
    font-size: 14px !important;
    padding-top: 0 !important;
    margin-top: 0 !important;
  }


  .sticky {
    position: sticky;
    top: 0;
    max-height: 60px;
    z-index: 2;
    background-color: white;
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
    border-left: 4px solid orange !important;
  }

  .max-width-100 {
    max-width: 100px;
  }

  .status-icon {
    max-width: 15%;
  }

  .status-input {
    max-width: 85%;
    padding-left: 6px;
  }

</style>
