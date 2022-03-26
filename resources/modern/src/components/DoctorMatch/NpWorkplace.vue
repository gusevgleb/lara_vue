<template>
  <tr>
    <td :rowspan="rowspan">{{ workplace.id }}</td>
    <td :rowspan="rowspan"><a :href="workplace.url" target="_blank">{{ workplace.name }}</a></td>
    <td :rowspan="rowspan">{{ workplace.specialities }}</td>
    <td class="pointer"
        :rowspan="rowspan"
        :class="{ strike: workplace.strike}"
        v-on:click="strike(workplace)"
    >
      Вычеркнуть
    </td>
  </tr>
</template>

<script>
import {
  SAVE_WORKPLACE_STRIKE,
} from '../../../constants';
'use strict'

export default {
  name: 'NpWorkplace',
  props: {
    workplace: Object,
    needRowspan: Boolean
  },
  computed: {
    rowspan: function () {
      let rowspan

      if (this.needRowspan) {
        rowspan = this.workplace.matchesCount + 1

        if (rowspan < 2) {
          rowspan = 2
        }
      } else {
        rowspan = 1
      }

      return rowspan
    }
  },
  methods: {
    strike: function (workplace) {
      this.axios.post(this.apiUrl + SAVE_WORKPLACE_STRIKE + workplace.id, {
        strike: !workplace.strike
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(() => {
          this.workplace.strike = !workplace.strike
        })
        .catch((error) => {
          console.error(error)
          alert('Не удалось изменить статус вычеркнутости')
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

  tr td:first-child {
    border-left: 1px solid #ddd;
  }

  tr td:nth-child(4) {
    border-right: 1px solid #ddd;
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
