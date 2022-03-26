<template>
  <div>
    <table>
      <thead>
      <tr>
        <th colspan="4">Места работы НП</th>
        <th colspan="10">Врачи в МИС</th>
      </tr>
      <tr class="sticky">
        <th>ID</th>
        <th>ФИО</th>
        <th>Специальности</th>
        <th>&nbsp;</th>

        <th>&nbsp;</th>
        <th>ID</th>
        <th>ФИО</th>
        <th>&nbsp;</th>
        <th>Специальности</th>
        <th>&nbsp;</th>
        <th>Всего</th>
        <th>{{new Date().toLocaleDateString('ru-RU')}}</th>
        <th>{{new Date(+new Date() + 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}}</th>
        <th v-on:click="getAllWindowsSingle()" style="cursor: pointer;">Запросить все</th>
      </tr>
      </thead>
      <transition-group tag="tbody" name="table-row">
        <template v-for="workplace in sortedWorkplaces" v-if="!workplace.strike || !!workplace.oaId">
          <!-- Рендерим место работы врача с НаПоправку -->
          <NpWorkplace :key="workplace.id" :workplace="workplace" need-rowspan/>

          <!-- Рендерим подходящих ему по ФИО врачей из МИС (если есть такие) -->
          <OaDoctor
              v-for="doctorId in workplace.matchesIds"
              v-if="!doctors[doctorId].strike || workplace.oaId === doctorId"
              v-on:check-windows="checkWindows(doctorId)"
              v-on:show-error="showError(doctorId)"
              v-on:strike-changed="strikeChanged(doctorId)"
              v-on:link-changed="linkChanged(doctorId)"
              :key="`oa-${workplace.id}-${doctorId}`"
              :workplace="workplace"
              :doctor-id="doctorId"
              :doctor="doctors[doctorId]"
              :integrationId="integrationId"
              :clinicId="clinicId"
              :enableServiceMatch="enableServiceMatch"
          />

          <!-- В МИС нет ни одного подходящего по ФИО врача на текущее место работы -->
          <OaDoctor
              v-if="workplace.matchesCount === 0"
              :key="`oa-${workplace.id}-no-matches`"
              :workplace="workplace"
              :doctor-id="null"
              :doctor="null"
              :integrationId="integrationId"
              :clinicId="clinicId"
          />
        </template>
      </transition-group>
    </table>

    <br>
    <hr>
    <h3>Места работы врачей с НаПоправку с непроставленным MIS_DOCTOR_ID</h3>

    <table>
      <thead>
      <tr class="sticky">
        <th>ID</th>
        <th>ФИО</th>
        <th>Специальности</th>
        <th>&nbsp;</th>
      </tr>
      </thead>
      <transition-group tag="tbody" name="table-row">
        <!-- Рендерим место работы врача с НаПоправку -->
        <NpWorkplace
            v-for="workplace in workplaces"
            v-if="!workplace.strike && workplace.oaId === ''"
            :key="workplace.id"
            :workplace="workplace"
        />
      </transition-group>
    </table>
    <div title="Скачать" class="icons8-microsoft-excel pointer download"
         v-on:click="exportCsvFile('Места работы врачей с НаПоправку с непроставленным MIS_DOCTOR_ID', workplacesForCsv)"></div>

    <br>
    <hr>
    <h3>Врачи из МИС, которые не связаны с врачами с портала</h3>

    <table>
      <thead>
      <tr class="sticky">
        <th colspan="4">&nbsp;</th>
        <th>ID</th>
        <th>ФИО</th>
        <th>Специальности</th>
        <th>&nbsp;</th>
        <th>Всего</th>
        <th>{{new Date().toLocaleDateString('ru-RU')}}</th>
        <th>{{new Date(+new Date() + 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}}</th>
        <th v-on:click="getAllWindowsSingle()" style="cursor: pointer;">Запросить все</th>
      </tr>
      </thead>
      <transition-group tag="tbody" name="table-row">
        <!-- Врачи из МИС, которые не связаны с врачами с портала -->
        <OaDoctor
            v-for="doctor in sortedDoctors"
            :key="`oa-${doctor.id}`"
            v-if="!doctor.strike && selectedDoctorsIds.indexOf(doctor.id) === -1"
            v-on:check-windows="checkWindows(doctor.id)"
            v-on:show-error="showError(doctor.id)"
            v-on:strike-changed="strikeChanged(doctor.id)"
            v-on:link-changed="linkChanged(doctor.id)"
            :workplace="null"
            :doctor-id="doctor.id"
            :doctor="doctor"
            :integrationId="integrationId"
            :clinicId="clinicId"
        />
      </transition-group>
    </table>
    <div title="Скачать" class="icons8-microsoft-excel pointer download"
         v-on:click="exportCsvFile('Врачи из МИС, которые не связаны с врачами с портала', doctorsForCsv)"></div>

    <br>
    <hr>
    <h3>Вычеркнутые места работы врачей с НаПоправку, которые не связаны с врачами с МИС</h3>

    <table>
      <thead>
      <tr class="sticky">
        <th>ID</th>
        <th>ФИО</th>
        <th>Специальности</th>
        <th>&nbsp;</th>
      </tr>
      </thead>
      <transition-group tag="tbody" name="table-row">
        <!-- Рендерим место работы врача с НаПоправку -->
        <NpWorkplace
            v-for="workplace in workplaces"
            v-if="workplace.strike && workplace.oaId === ''"
            :key="workplace.id"
            :workplace="workplace"
        />
      </transition-group>
    </table>

    <br>
    <hr>
    <h3>Вычеркнутые врачи из МИС, которые не связаны с врачами с портала</h3>

    <table>
      <thead>
      <tr class="sticky">
        <th colspan="4">&nbsp;</th>
        <th>ID</th>
        <th>ФИО</th>
        <th>Специальности</th>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
      </tr>
      </thead>
      <transition-group tag="tbody" name="table-row">
        <OaDoctor
            v-for="doctor in sortedDoctors"
            :key="`oa-${doctor.id}`"
            v-if="doctor.strike && selectedDoctorsIds.indexOf(doctor.id) === -1"
            v-on:check-windows="checkWindows(doctor.id)"
            v-on:show-error="showError(doctor.id)"
            v-on:strike-changed="strikeChanged(doctor.id)"
            v-on:link-changed="linkChanged(doctor.id)"
            :workplace="null"
            :doctor-id="doctor.id"
            :doctor="doctor"
            :integrationId="integrationId"
            :clinicId="clinicId"
        />
      </transition-group>
    </table>

  </div>
</template>

<script>
'use strict'
/* eslint vue/no-use-v-if-with-v-for: 0 */
/* eslint no-prototype-builtins: 0 */

import {
  GET_DOCTOR_MATCH_ALL_FREE_SLOTS,
} from '../../../constants';

import Vue from 'vue'
import OaDoctor from './OaDoctor'
import NpWorkplace from './NpWorkplace'
// import debounce from "debounce";

export default {
  name: 'MatchTable',
  props: ['npWorkplaces', 'oaDoctors', 'matchMatrix', 'integrationId', 'clinicId', 'enableServiceMatch', 'isSyncRequestSlots',
  'isAwaitRequestSlots'],
  components: {NpWorkplace, OaDoctor},
  methods: {
    checkWindows: async function (doctorId) {
      this.doctors[doctorId].windows = '...'

     await this.axios.post(this.apiUrl + GET_DOCTOR_MATCH_ALL_FREE_SLOTS + this.integrationId,{
        clinicId: this.clinicId,
        doctorId: doctorId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
          .then((response) => {
            if (typeof response.data.error_message === 'undefined') {
              this.doctors[doctorId].windows = response.data[doctorId];
            } else {
              this.doctors[doctorId].windows = {
                slots_total: -1,
                slots_today: 0,
                slots_tomorrow: 0,
                error_message: response.data.error_message,
              };
            }
          })
          .catch((error) => {
            console.error(error);
            this.doctors[doctorId].windows = {
              slots_total: -1,
              slots_today: 0,
              slots_tomorrow: 0,
              error_message: error.response.status + ' error',
            };
          })
    },

    getAllWindowsSingle: async function () {
      for (let id in this.doctors) {
        if (this.doctors.hasOwnProperty(id) && !this.doctors[id].notExists) {
          this.doctors[id].windows = '...'
        }
      }

      if (this.isSyncRequestSlots) {
        this.axios.post(this.apiUrl + GET_DOCTOR_MATCH_ALL_FREE_SLOTS + this.integrationId, {
          clinicId: this.clinicId,
        }).then((response) => {
          if (typeof response.data.error_message !== 'undefined') {
            for (let id in this.doctors) {
              this.doctors[id].windows = {
                slots_total: -1,
                slots_today: 0,
                slots_tomorrow: 0,
                error_message: response.data.error_message,
              };
            }
            alert(response.data.error_message);
          } else {
            for(let id in response.data) {
              this.doctors[id].windows = response.data[id]
            }
          }
        }).catch((error) => {
          console.error(error)
          for (let id in this.doctors) {
            if (!this.doctors[id].notExists) {
              this.doctors[id].windows = {
                slots_total: -1,
                slots_today: 0,
                slots_tomorrow: 0,
                error_message: error.response.status + ' error',
              };
            }
          }
          alert(error.response.status + ' error');
        });
      } else {
        for (let id in this.doctors) {
          if (!this.doctors[id].notExists) {
            if (this.isAwaitRequestSlots) {
              await this.checkWindows(id);
            } else {
              this.checkWindows(id);
            }
          }
        }
      }
    },

    showError: function (doctorId) {
      alert(this.doctors[doctorId].windows['error_message']);
    },

    strikeChanged: function (doctorId) {
      for (let k in this.workplaces) {
        // eslint-disable-line no-prototype-builtins
        if (!this.workplaces.hasOwnProperty(k)) {
          continue
        }

        let workplace = this.workplaces[k]

        if (this.doctors.hasOwnProperty(doctorId) &&
            this.doctors[doctorId].strike &&
            workplace.matchesIds.indexOf(doctorId) !== -1 &&
            doctorId !== workplace.oaId // врач не пристыкован
        ) {
          // если врач вычеркнут, то исключим его из списка доступных (если он еще там)
          // delete workplace.matchesIds[workplace.matchesIds.indexOf(doctorId)]
          this.$delete(workplace.matchesIds, workplace.matchesIds.indexOf(doctorId)) // unset() with reactivity
          workplace.matchesCount = workplace.matchesIds.length
        } else if (!this.doctors[doctorId].strike &&
            workplace.matchesIds.indexOf(doctorId) === -1 &&
            this.matchMatrix.hasOwnProperty(workplace.id) &&
            this.matchMatrix[workplace.id].hasOwnProperty(doctorId) // этот врач похож на это место работы?
        ) {
          // если врач перестал быть вычеркнут, то вернем его в список доступных
          let newMatchesIds = workplace.matchesIds.slice()
          newMatchesIds.push(doctorId)

          this.$set(workplace, 'matchesIds', newMatchesIds) // for reactivity

          workplace.matchesCount = workplace.matchesIds.length
        }
      }
    },
    linkChanged: function (doctorId) {
      let linkedDoctorsIds = []

      for (let k in this.workplaces) {
        if (this.workplaces.hasOwnProperty(k)) {
          let workplace = this.workplaces[k]

          if (workplace.oaId !== '') {
            if (linkedDoctorsIds.indexOf(workplace.oaId) === -1) {
              linkedDoctorsIds.push(workplace.oaId)
            }
          }
        }
      }

      for (let doctorId in this.doctors) {
        if (this.doctors.hasOwnProperty(doctorId)) {
          this.doctors[doctorId].linked = linkedDoctorsIds.indexOf(doctorId) !== -1
        }
      }

      return doctorId
    },
    convertToCSV: function (objArray) {
      let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
      let str = ''

      for (let i = 0; i < array.length; i++) {
        let line = ''

        for (let index in array[i]) {
          if (line !== '') line += ';'

          line += array[i][index]
        }

        str += line + '\r\n'
      }

      return str
    },
    exportCsvFile: function (filename, items) {
      let jsonObject = JSON.stringify(items)

      let csv = this.convertToCSV(jsonObject)

      let exportedFilenmae = filename + '.csv' || 'export.csv'

      let blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})

      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae)
      } else {
        let link = document.createElement('a')

        if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          let url = URL.createObjectURL(blob)

          link.setAttribute('href', url)
          link.setAttribute('download', exportedFilenmae)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    }
  },
  computed: {
    sortedWorkplaces: function () {
      let sortedWorkplaces = []

      for (let id in this.workplaces) {
        if (this.workplaces.hasOwnProperty(id)) {
          sortedWorkplaces.push(this.workplaces[id])
        }
      }

      sortedWorkplaces.sort((function (self) {
        return function (a, b) {
          let notExistsA = (a.oaId !== '' && !self.doctors.hasOwnProperty(a.oaId)) ? 1 : 0
          let notExistsB = (b.oaId !== '' && !self.doctors.hasOwnProperty(b.oaId)) ? 1 : 0

          if (notExistsA !== notExistsB) {
            return notExistsA - notExistsB
          }

          return a.name.localeCompare(b.name)
        }
      }(this)))

      return sortedWorkplaces
    },
    sortedDoctors: function () {
      let sortedDoctors = []

      for (let id in this.doctors) {
        if (this.doctors.hasOwnProperty(id)) {
          sortedDoctors.push(this.doctors[id])
        }
      }

      sortedDoctors.sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })

      return sortedDoctors
    },
    selectedDoctorsIds: function () {
      let selectedDoctorsIds = []

      for (let k in this.workplaces) {
        if (this.workplaces.hasOwnProperty(k)) {
          let workplace = this.workplaces[k]

          if (workplace.oaId !== '' && selectedDoctorsIds.indexOf(workplace.oaId) === -1) {
            selectedDoctorsIds.push(workplace.oaId)
          }
        }
      }

      return selectedDoctorsIds
    },
    workplacesForCsv: function () {
      let workplacesForCsv = []

      for (let id in this.workplaces) {
        if (this.workplaces.hasOwnProperty(id) && this.workplaces[id].oaId === '' && !this.workplaces[id].strike) {
          workplacesForCsv.push({
            id: this.workplaces[id].id,
            name: this.workplaces[id].name,
            spec: this.workplaces[id].specialities
          })
        }
      }

      return workplacesForCsv
    },
    doctorsForCsv: function () {
      let doctorsForCsv = []
      for (let id in this.sortedDoctors) {
        if (this.sortedDoctors.hasOwnProperty(id)) {
          let doctorId = this.sortedDoctors[id].id
          let isNotSelected = this.selectedDoctorsIds.indexOf(doctorId) === -1
          if (!this.sortedDoctors[id].strike && isNotSelected) {
            doctorsForCsv.push({
              id: this.sortedDoctors[id].id,
              name: this.sortedDoctors[id].name,
              spec: this.sortedDoctors[id].comment
            })
          }
        }
      }

      return doctorsForCsv
    }
  },
  watch: {
    oaDoctors: function (oaDoctors) {
      let doctors = Vue.util.extend({}, oaDoctors)
      let knownDoctorsIds = []
      let linkedDoctorsIds = []

      for (let k in doctors) {
        doctors[k].id = doctors[k].id.toString()
        knownDoctorsIds.push(doctors[k].id)
        this.$set(doctors[k], 'windows', null) // по умолчанию - неизвестно, есть ли окна
      }

      for (let k in this.npWorkplaces) {
        if (this.npWorkplaces.hasOwnProperty(k)) {
          let workplace = this.npWorkplaces[k]

          if (workplace.oaId !== '') {
            if (linkedDoctorsIds.indexOf(workplace.oaId) === -1) {
              linkedDoctorsIds.push(workplace.oaId)
            }

            if (knownDoctorsIds.indexOf(workplace.oaId) === -1) {
              knownDoctorsIds.push(workplace.oaId)
              doctors[workplace.oaId] = {
                id: workplace.oaId,
                name: 'такой врач в МИС не найден!',
                comment: '',
                windows: false,
                notExists: true
              }
            }
          }
        }
      }

      for (let doctorId in doctors) {
        this.$set(doctors[doctorId], 'linked', linkedDoctorsIds.indexOf(doctorId) !== -1)
      }

      this.doctors = doctors
    },
    npWorkplaces: function (npWorkplaces) {
      let workplaces = Vue.util.extend({}, npWorkplaces)

      for (let k in workplaces) {
        if (!workplaces.hasOwnProperty(k)) {
          continue
        }

        let workplace = workplaces[k]
        let matchesIds = []

        if (this.matchMatrix.hasOwnProperty(workplace.id)) {
          matchesIds = Object.keys(this.matchMatrix[workplace.id])
            .filter(OaDoctorId => this.doctors.hasOwnProperty(OaDoctorId) && !this.doctors[OaDoctorId].strike)
        }

        if (workplace.oaId !== '' && matchesIds.indexOf(workplace.oaId) === -1) {
          matchesIds.push(workplace.oaId)
        }

        this.$set(workplace, 'matchesIds', matchesIds)
        this.$set(workplace, 'matchesCount', matchesIds.length)
      }

      this.workplaces = workplaces
    }
  },
  data () {
    return {
      doctors: {},
      workplaces: {}
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table {
  border-spacing: 0;
  border-collapse: separate;
}

table th {
  text-align: center;
  padding: 0 5px !important;
}

tr:first-child th {
  border-top: 1px solid #ddd;
}

th {
  border-bottom: 1px solid #ddd;
  padding: 8px;
}

tr th:nth-child(1) {
  border-left: 1px solid #ddd;
}

tr th:nth-last-child(1) {
  border-right: 1px solid #ddd;
}

tr:nth-of-type(2n) {
  background-color: #fff;
}

.table-row-item {
  display: inline-block;
  margin-right: 10px;
}

.table-row-enter-active, .table-row-leave-active {
  transition: all .5s;
}

.table-row-enter, .table-row-leave-to /* .list-leave-active до версии 2.1.8 */
{
  opacity: 0;
  transform: translateX(120px);
}

.download {
  text-align: left;
}

.pointer {
  cursor: pointer;
}

.icons8-microsoft-excel {
  display: inline-block;
  width: 48px;
  height: 48px;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IgogICAgIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIKICAgICB2aWV3Qm94PSIwIDAgNDggNDgiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDsiPjxnIGlkPSJzdXJmYWNlMSI+PHBhdGggc3R5bGU9IiBmaWxsOiM0Q0FGNTA7IiBkPSJNIDQxIDEwIEwgMjUgMTAgTCAyNSAzOCBMIDQxIDM4IEMgNDEuNTU0Njg4IDM4IDQyIDM3LjU1NDY4OCA0MiAzNyBMIDQyIDExIEMgNDIgMTAuNDQ1MzEzIDQxLjU1NDY4OCAxMCA0MSAxMCBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAzMiAxNSBMIDM5IDE1IEwgMzkgMTggTCAzMiAxOCBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAzMiAyNSBMIDM5IDI1IEwgMzkgMjggTCAzMiAyOCBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAzMiAzMCBMIDM5IDMwIEwgMzkgMzMgTCAzMiAzMyBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAzMiAyMCBMIDM5IDIwIEwgMzkgMjMgTCAzMiAyMyBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAyNSAxNSBMIDMwIDE1IEwgMzAgMTggTCAyNSAxOCBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAyNSAyNSBMIDMwIDI1IEwgMzAgMjggTCAyNSAyOCBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAyNSAzMCBMIDMwIDMwIEwgMzAgMzMgTCAyNSAzMyBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAyNSAyMCBMIDMwIDIwIEwgMzAgMjMgTCAyNSAyMyBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojMkU3RDMyOyIgZD0iTSAyNyA0MiBMIDYgMzggTCA2IDEwIEwgMjcgNiBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkZGRkZGOyIgZD0iTSAxOS4xMjg5MDYgMzEgTCAxNi43MTg3NSAyNi40Mzc1IEMgMTYuNjI1IDI2LjI2OTUzMSAxNi41MzEyNSAyNS45NTcwMzEgMTYuNDMzNTk0IDI1LjUgTCAxNi4zOTg0MzggMjUuNSBDIDE2LjM1MTU2MyAyNS43MTQ4NDQgMTYuMjQyMTg4IDI2LjA0Mjk2OSAxNi4wNzQyMTkgMjYuNDgwNDY5IEwgMTMuNjUyMzQ0IDMxIEwgOS44OTQ1MzEgMzEgTCAxNC4zNTU0NjkgMjQgTCAxMC4yNzM0MzggMTcgTCAxNC4xMDkzNzUgMTcgTCAxNi4xMTMyODEgMjEuMTk1MzEzIEMgMTYuMjY5NTMxIDIxLjUyNzM0NCAxNi40MDYyNSAyMS45MjE4NzUgMTYuNTMxMjUgMjIuMzc1IEwgMTYuNTcwMzEzIDIyLjM3NSBDIDE2LjY0ODQzOCAyMi4xMDU0NjkgMTYuNzk2ODc1IDIxLjY5NTMxMyAxNy4wMTE3MTkgMjEuMTU2MjUgTCAxOS4yMzgyODEgMTcgTCAyMi43NTM5MDYgMTcgTCAxOC41NTQ2ODggMjMuOTM3NSBMIDIyLjg2NzE4OCAzMC45OTYwOTQgTCAxOS4xMjg5MDYgMzAuOTk2MDk0IFogIj48L3BhdGg+PC9nPjwvc3ZnPg==') 50% 50% no-repeat;
  background-size: 100%;
}

.sticky th {
  /*noinspection CssInvalidFunction*/
  box-shadow: 0 2px 3px -1px rgb(0 0 0 / 60%) !important;
  background: white;
  --bs-table-bg: white;
  position: sticky;
  top: 0;
}
</style>
