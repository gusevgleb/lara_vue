<template>
  <v-app>
    <v-main>
      <v-container fluid class="v-container-fluid">

        <v-card
            class="mx-auto mb-3"
            outlined
            max-width="90%"
            tile
        >
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <h3>Список последних запросов</h3>
                <a :href="'/internal/stata/drivers/last-raw-requests/' + integration_id">Открыть в старом формате</a>
                <br>
                <a :href="'/internal/stata/drivers/last-raw-requests/' + integration_id" :download="'raw_requests_' + integration_id + '.logs'">Скачать</a>
              </v-list-item-title>
              <br>
              <br>
              <div v-if="!is_data_ready">
                Загрузка...
              </div>
              <div v-else>
                <h2 v-if="requests.length === 0">Запросов нет</h2>
                <div v-for="(data, i) in requests" v-bind:key="i" class="request-row">
                  <div>
                    <div class="request-header mt-2" @click="openRequest(data)">
                      <span class="request-url">{{ data.key }}</span>
                      <span class="request-date">{{ data.date }}</span>
                    </div>
                    <pre class="request-body" v-if="data.active">
Raw request:
{{ requests_data[data.id]['request'] }}

Raw response:
{{ requests_data[data.id]['response'] }}
                    </pre>
                  </div>
                </div>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-card>

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import {GET_REQUEST_BY_ID_NAME, GET_REQUESTS_LIST} from "../../constants";
import axios from "axios";

export default {
  name: "LastRawRequests",

  data() {
    return {
      requests: [],
      requests_data: {},
      is_data_ready: false,
    };
  },

  mounted() {
    axios.get(this.apiUrl + GET_REQUESTS_LIST + this.integration_id)
      .then(response => {
        this.requests = response.data;
        this.is_data_ready = true;
      });
  },

  props: {
    integration_id: {
      type: String,
    },
  },

  created() {
    document.title = 'Последние запросы к интеграции';
  },
  methods: {
    openRequest(item) {
      if (typeof(this.requests_data[item.id]) !== "undefined") {
        item.active = !item.active;
        return;
      }

      axios.get(this.apiUrl + GET_REQUEST_BY_ID_NAME + this.integration_id + '/' + item.id)
        .then(response => {
          this.requests_data[item.id] = response.data;
        }).then(() => {
          item.active = !item.active;
        });
    },
  },
}
</script>

<style scoped>
li {
  margin-bottom: 5px;
  font-weight: bold;
}

.request-body {
  margin: 8px 0;
  background: white;
  width: 80vw;
  border: 1px solid black;
  position: relative;
  float: left;
  cursor: auto;
}

.request-row {
  cursor: pointer;
  margin-bottom: 40px;
  overflow: hidden;
}

.request-header {
  padding: 6px 2px;
  border-bottom: 1px solid #8e8e8e;
}

.request-header:hover {
  background: #d0d0d0;
}

.request-url {
  font-size: 16px;
  color: #010190;
}

.request-date {
  float: right;
  color: #6d6d6d;
}

.textDoctor {
  font-size: 14pt;
}
</style>
