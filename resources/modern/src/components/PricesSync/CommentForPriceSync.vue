<template>
  <div>
    <v-card>
      <v-card-title>
        Комментарий к прайсу
      </v-card-title>

      <v-card-text>
        <v-textarea
            rows="2"
            auto-grow
            v-model="commentForIntegration"
        />

        <v-alert
            v-model="alert.show"
            :type="alert.type"
            dismissible
        >
          {{ alert.message }}
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="white--text text-right ml-2"
               color="teal darken-2"
               text
               @click="saveComment"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import {SAVE_COMMENT_URL} from "../../../constants";

export default {
  name: "CommentForPriceSync",

  props: {
    pricesSync: {
      type: Object,
      required: true,
    },

    integrationId: {
      type: Number,
      required: true,
    },

    misClinicId: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    commentForIntegration: '',

    alert: {
      show: false,
      type: 'success',
      message: '',
    },
  }),

  created() {
    this.alert.show = false;
    this.commentForIntegration = this.pricesSync.comment || '';
  },

  methods: {
    saveComment() {
      this.pricesSync.comment = this.commentForIntegration;

      let data = {
        integration_id: this.integrationId,
        mis_clinic_id: this.misClinicId,
        prices_sync_info: this.pricesSync,
      };

      axios.post(this.apiUrl + SAVE_COMMENT_URL, data).then(response => {
        this.pricesSync.id = response.data.data.id;

        this.showSuccessMessage('success', response.data.message);
      }).catch(error => {
        this.showSuccessMessage('error', error);
      });
    },

    showSuccessMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },
  }
}
</script>
