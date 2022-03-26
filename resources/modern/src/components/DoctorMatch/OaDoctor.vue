<template>
  <tr :class="{
    notExists: doctor && doctor.notExists,
    grayed: workplace && workplace.oaId !== '' && workplace.oaId !== doctorId
  }">
    <template v-if="workplace && workplace.matchesCount === 0">
      <td colspan="10" class="no-match">no match</td>
    </template>

    <template v-else-if="workplace">
      <td><input type="checkbox"
                 :title="workplace.oaId === doctorId ? 'Отвязать?' : 'Связать?'"
                 :checked="workplace.oaId === doctorId"
                 :disabled="workplace.ajaxLoading"
                 v-on:change="onChange(workplace, doctorId, $event);onChangeServiceId(workplace, doctor.comment, $event)"
      /></td>
      <td>{{ doctorId }}</td>
      <td>{{ doctor.name }}</td>
      <td>
      </td>
      <td>
        <div v-if="this.enableServiceMatch">
          <span
            v-for="(comment, i) in doctor.comment.split('; ')"
            v-bind:key="i"
          >
            <input type="checkbox"
                   :title="workplace.oaServiceId === comment.split(' - ')[0] ? 'Отвязать?' : 'Связать?'"
                   :checked="workplace.oaServiceId === comment.split(' - ')[0]"
                   :disabled="workplace.ajaxLoading || workplace.oaId !== doctorId"
                   v-on:change="onChangeServiceId(workplace, comment.split(' - ')[0], $event)"
            />
             {{ comment.split(' - ')[1] }}<br>
          </span>
        </div>
        <div v-else>
          {{ doctor.comment }}
        </div>
      </td>
      <td><textarea
        :value="doctor.remark"
        v-on:input="onRemarkChanged($event)"
        v-bind:class="{'updating': this.savedRemark !== null}"
      ></textarea></td>
      <td colspan="3" v-if="doctor.windows === null">
        <template v-if="!doctor.notExists">
          <transition name="fade" mode="out-in">
            <a href="#" v-on:click="checkWindows($event)">Окна?</a>
          </transition>
        </template>
      </td>
      <td v-else v-for="item in days" :key="item" class="slotsCount"
          :class="{'windows-exists-bg': parseInt(doctor.windows[item]) > 0 && item === 'slots_total', 'windows-not-exists-bg': parseInt(doctor.windows[item]) <= 0 && item === 'slots_total'}">
        <transition name="fade" mode="out-in">
          <span v-if="doctor.windows === '...'">...</span>
          <span class="windows-exists" v-else-if="parseInt(doctor.windows[item]) > 0">{{ doctor.windows[item] }}</span>
          <span class="windows-not-exists" v-else-if="parseInt(doctor.windows[item]) === -1" v-on:click.prevent="showError()"><a href="#">Ошибка</a></span>
          <span class="windows-not-exists" v-else>Нет</span>
        </transition>
      </td>
      <td :class="{ strike: doctor && doctor.strike}">
        <div v-if="!doctor.notExists && !doctor.linked"
             class="pointer"
             v-on:click="strike(doctor)"
        >
          <span v-if="doctor && doctor.strike">Вычеркнутый</span>
          <span v-else>Вычеркнуть</span>
        </div>
      </td>
    </template>

    <template v-else>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>{{ doctor.id }}</td>
      <td>{{ doctor.name }}</td>
      <td>{{ doctor.comment }}</td>
      <td><textarea
        :value="doctor.remark"
        v-on:input="onRemarkChanged($event)"
        v-bind:class="{'updating': this.savedRemark !== null}"
      ></textarea></td>
      <td colspan="3" v-if="doctor.windows === null">
        <template v-if="!doctor.notExists">
          <transition name="fade" mode="out-in">
            <a href="#" v-on:click="checkWindows($event)">Окна?</a>
          </transition>
        </template>
      </td>
      <td v-else v-for="item in days" :key="item" class="slotsCount"
          :class="{'windows-exists-bg': parseInt(doctor.windows[item]) > 0 && item === 'slots_total', 'windows-not-exists-bg': parseInt(doctor.windows[item]) <= 0 && item === 'slots_total'}">
        <transition name="fade" mode="out-in">
          <span v-if="doctor.windows === '...'">...</span>
          <span class="windows-exists" v-else-if="parseInt(doctor.windows[item]) > 0">{{ doctor.windows[item] }}</span>
          <span class="windows-not-exists" v-else-if="parseInt(doctor.windows[item]) === -1" v-on:click.prevent="showError()"><a href="#">Ошибка</a></span>
          <span class="windows-not-exists" v-else>Нет</span>
        </transition>
      </td>
      <td :class="{ strike: doctor && doctor.strike}">
        <div v-if="!doctor.notExists && !doctor.linked"
             class="pointer"
             v-on:click="strike(doctor)"
        >
          <span v-if="doctor && doctor.strike">Вычеркнутый</span>
          <span v-else>Вычеркнуть</span>
        </div>
      </td>
    </template>
  </tr>
</template>

<script>
import debounce from 'debounce'
import {
  SAVE_DOCTOR_MIS_SERVICE_ID,
  SAVE_DOCTOR_REMARK,
  SAVE_DOCTOR_STRIKE,
  SAVE_DOCTOR_MIS_DOCTOR_ID,
} from '../../../constants';

export default {
  name: 'OaDoctor',

  props: ['integrationId', 'clinicId', 'workplace', 'doctorId', 'doctor', 'enableServiceMatch'],
  data () {
    return {
      savedRemark: null,
      days: ['slots_total', 'slots_today', 'slots_tomorrow']
    }
  },
  created () {
    this.saveRemark = debounce(this.saveRemark, 500)
  },
  mounted() {
    this.cutComments()
  },
  methods: {
    cutComments: function () {
      if (this.doctor.comment.length > 40) {
        let buffer = this.doctor.comment.split(',');
        this.doctor.comment = buffer.join(', ');
      }
    },
    checkWindows: function ($event) {
      $event.preventDefault()

      this.$emit('check-windows')
    },
    showError: function () {
      this.$emit('show-error')
    },
    onRemarkChanged: function ($event) {
      let newValue = $event.target.value

      if (this.savedRemark === null) {
        this.savedRemark = this.doctor.remark
      }

      this.doctor.remark = newValue
      this.saveRemark()
    },
    strike: function (doctor) {
      this.axios.post(this.apiUrl + SAVE_DOCTOR_STRIKE + this.integrationId, {
        clinicId: this.clinicId,
        doctorId: doctor.id,
        strike: !doctor.strike
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(() => {
          this.doctor.strike = !doctor.strike
          this.$emit('strike-changed')
        })
        .catch((error) => {
          console.error(error)
          alert('Не удалось изменить статус вычеркнутости')
        })
    },
    saveRemark: function () {
      let newRemark = this.doctor.remark

      this.axios.post(this.apiUrl + SAVE_DOCTOR_REMARK + this.integrationId, {
        clinicId: this.clinicId,
        doctorId: this.doctorId,
        prevRemark: this.savedRemark,
        newRemark: newRemark
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response) => {
          if (response && response.data && response.data.status === 'success') {
            this.savedRemark = null
          } else {
            alert('Заметка не сохранена! Вероятно, кто-то уже изменил ее, обновите страницу.')
          }
        })
        .catch((error) => {
          console.error(error)
        })
    },
    onChangeServiceId: function (workplace, serviceId, $event) {
      if (!this.enableServiceMatch) {
        return
      }

      let checked = !!$event.target.checked

      workplace.oaServiceId = checked ? serviceId : ''

      this.$set(workplace, 'ajaxLoading', true)

      this.$emit('link-changed')

      this.axios.post(this.apiUrl + SAVE_DOCTOR_MIS_SERVICE_ID + workplace.id, {
        oaServiceId: workplace.oaServiceId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response) => {
          workplace.ajaxLoading = false
          console.info(response)
        })
        .catch((error) => {
          console.error(error)
        })
    },
    onChange: function (workplace, doctorId, $event) {
      let checked = !!$event.target.checked

      workplace.oaId = checked ? doctorId : ''

      if (!checked) {
        workplace.oaServiceId = ''
      }

      this.$set(workplace, 'ajaxLoading', true)

      this.$emit('link-changed')

      this.axios.post(this.apiUrl + SAVE_DOCTOR_MIS_DOCTOR_ID + workplace.id, {
        oaId: workplace.oaId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(() => {
        if (!this.enableServiceMatch) {
          return
        }

        this.axios.post(this.apiUrl + SAVE_DOCTOR_MIS_SERVICE_ID + workplace.id, {
          oaServiceId: workplace.oaServiceId
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      })
        .then((response) => {
          workplace.ajaxLoading = false
          console.info(response)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
}
</script>

<style scoped>
  td {
    border-bottom: 1px solid #ddd;
    padding: 8px;
  }

  td:last-child {
    border-right: 1px solid #ddd;
  }

  td:first-child {
    border-left: 1px solid #ddd;
  }

  .no-match {
    color: red;
  }

  .windows-not-exists-bg {
    background-color: #e04b4c;
  }

  .windows-exists-bg {
    background-color: #66c266;
  }

  .windows-not-exists {
    color: red;
  }

  .windows-not-exists a {
    color: white;
  }

  .windows-exists {
    color: green;
  }

  .slotsCount {
    text-align: center;
  }

  .windows-exists-bg span, .windows-not-exists-bg span {
    color: white;
  }

  .disabled {
    color: lightgray;
  }

  .grayed {
    color: gray;
  }

  .notExists {
    color: red;
  }

  .updating {
    background-color: #fffbd2;
  }

  .pointer {
    cursor: pointer;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .strike {
    text-decoration: line-through;
    color: lightgray;
  }
</style>
