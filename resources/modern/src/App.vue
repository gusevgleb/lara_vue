<template>
  <div id="app">
    <Header v-if="$route.name !== null && $route.name !== 'pageNotFound' && $route.name !== 'VisualSlots'"/>
    <router-view/>
  </div>
</template>

<script>
import Header from "./components/Header";

export default {
  name: 'App',
  components: {
    Header
  },
  data: () => ({
    message: {
      show: false,
      text: '',
    },
  }),

}
</script>

<style>
@import 'assets/css/bootstrap.min.css';

#app, body {
  margin: 0;
}

</style>
