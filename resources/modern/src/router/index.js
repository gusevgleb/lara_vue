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
  ]),
    ...prefix('/main', [
        {
            path: '/welcome',
            name: 'welcome',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ '../views/WelcomePage.vue')
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
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
