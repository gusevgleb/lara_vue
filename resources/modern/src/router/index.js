import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function prefix(prefix, routes) {
  return routes.map((route) => {
    route.path = prefix + route.path
    return route
  })
}

const routes = [
  ...prefix('/public', [
    {
      path: '/slots',
      name: 'VisualSlots',
      // route level code-splitting
      // this generates a separate chunk (visualSLots.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(
        /* webpackChunkName: "visualSLots" */
        '../views/VisualSlots'
        )
    },
  ]),
  ...prefix('/vue', [
    {
      path: '/prices-sync',
      name: 'PricesSync',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/PricesSync.vue')
    },
    {
      path: '/prices-integration-list',
      name: 'pricesIntegrationList',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/PricesIntegrationList.vue')
    },
    {
      path: '/prices-integration-list/:status',
      name: 'pricesIntegrationListOnlyStatus',
      props: true,
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/PricesIntegrationList.vue')
    },
    {
      path: '/doctor-match',
      name: 'DoctorMatch',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/DoctorMatch')
    },
    {
      path: '/prices-stats',
      name: 'pricesSyncStats',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/PricesSyncStats')
    },
    {
      path: '/last-raw-requests/:integration_id',
      name: 'lastRawRequests',
      props: true,
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/LastRawRequests')
    },
    {
      path: '/integrations',
      name: 'integrationList',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/IntegrationList')
    },
    {
      path: '/integrations_disabled',
      name: 'integrationListDisabled',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/IntegrationListDisabled')
    },
    {
      path: '/integrations_fake',
      name: 'integrationListFake',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/IntegrationListFake')
    },
    {
      path: '/multi_prices_sync',
      name: 'multiPricesSync',
      component: () => import(/* webpackChunkName: "about" */ '../views/MultiPriceSync')
    },
  ]),
  {
    path: '*',
    name: 'pageNotFound',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/PageNotFound.vue')
  },

    {
        path: '/update',
        name: 'test',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/MultiPriceSync')
    },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
