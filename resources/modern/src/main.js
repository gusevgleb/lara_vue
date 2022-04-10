import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import VueClipboard from 'vue-clipboard2'

Vue.config.productionTip = false
Vue.use(VueClipboard);

const host = 'http://127.0.0.1:8000/';
Vue.mixin({
    data: () => ({
        message: {
            show: false,
            text: '',
        },
        apiUrl: host,
    }),

methods: {
    getUrlParam(param) {
        let urlString = window.location.href;
        let url = new URL(urlString);

        return url.searchParams.get(param);
    },

    showMessage(text) {
        this.message.show = true;
        this.message.text = text;
    },
    },
});

new Vue({
    vuetify,
    router,
    render: h => h(App)
}).$mount('#app');
