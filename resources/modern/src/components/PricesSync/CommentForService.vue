<template>
  <div>
    <v-card>
      <v-card-title>
        Комментарий к услуге {{ serviceForComment.service_name }}
      </v-card-title>

      <v-card-text>
        <v-textarea
          rows="2"
          auto-grow
          v-model="serviceForComment.service_comment"
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
import {SAVE_SERVICE_COMMENT_URL} from "../../../constants";

export default {
  name: "CommentForService",

  props: {
    serviceForComment: {
      type: Object,
      required: true,
    },

  },

  data: () => ({
    alert: {
      show: false,
      type: 'success',
      message: '',
    },
  }),

  created() {
    this.alert.show = false;
  },

  methods: {
    saveComment() {
      let data = {
        price_id: this.serviceForComment.id,
        comment: this.serviceForComment.service_comment,
      };

      axios.post(this.apiUrl + SAVE_SERVICE_COMMENT_URL, data).then(response => {

        this.showMessage('success', response.data.message);

        setTimeout(() => this.$emit('close-modal'), 1000)

      }).catch(error => {
        this.showMessage('error', error.response.data.message);
      });
    },

    showMessage(type, message) {
      this.alert.type = type;
      this.alert.message = message;

      this.alert.show = true;
    },
  }
}
</script>
