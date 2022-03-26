<template>
  <div id="doctor_match">
    <div>
      <div class="title">Интеграция: [#{{ integrationId }}] {{ integrationTitle }}</div>
      <div class="title">Филиал: [#{{ clinicId }}] {{ clinicTitle }}</div>
    </div>
    <MatchTable
        :npWorkplaces="npWorkplaces"
        :oaDoctors="doctors"
        :matchMatrix="matchMatrix"
        :integrationId="integrationId"
        :clinicId="clinicId"
        :enableServiceMatch="enableServiceMatch"
        :isSyncRequestSlots="isSyncRequestSlots"
        :isAwaitRequestSlots="isAwaitRequestSlots"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import MatchTable from '../components/DoctorMatch/MatchTable'
import {
  GET_DOCTOR_MATCH,
} from '../../constants';

Vue.use(VueAxios, axios)

let url = new URL(window.location.href)
let integrationId = url.searchParams.get('integrationId')
let clinicId = url.searchParams.get('clinicId')
let dataUrl = GET_DOCTOR_MATCH + integrationId

if (clinicId === null) {
  clinicId = ''
}

if (clinicId !== '') {
  dataUrl += '/' + clinicId
}

export default {
  name: 'App',
  created () {
    document.title = 'Сопоставление врачей';
  },
  components: {
    MatchTable
  },
  data () {
    return {
      integrationId: integrationId,
      clinicId: clinicId,
      integrationTitle: '',
      clinicTitle: '',
      npWorkplaces: [],
      doctors: {},
      matchMatrix: {},
      enableServiceMatch: false,
      isSyncRequestSlots: false,
      isAwaitRequestSlots: false,
    }
  },
  mounted () {
    this.axios
        .get(this.apiUrl + dataUrl)
        .then(response => {
          if (typeof response.data === 'string') {
            alert(response.data)
            return
          }

          this.integrationTitle = response.data.integrationTitle;
          this.clinicTitle = response.data.clinicTitle;
          this.npWorkplaces = response.data.npWorkplaces;
          this.doctors = response.data.doctors;
          this.matchMatrix = response.data.matchMatrix;
          this.enableServiceMatch = !!response.data.enableServiceMatch;
          this.isSyncRequestSlots = !!response.data.isSyncRequestSlots;
          this.isAwaitRequestSlots = !!response.data.isAwaitRequestSlots;
        })
  }
}
</script>

<style>
h3 {
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

h2 {
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

h1 {
  margin-block-start: 0.67em;
  margin-block-end: 0.67em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

#doctor_match {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 5px;
}

.title {
  text-align: left;
  padding: 0 25px 25px 25px;
  font-weight: bold;
  font-size: larger;
}
</style>
