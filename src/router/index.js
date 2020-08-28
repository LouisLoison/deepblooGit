import Vue from "vue"
import Router from "vue-router"
import paths from "./paths"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

Vue.use(Router)

const router = new Router({
  base: process.env.BASE_URL,
  routes: paths,

  // Build smooth transition logic with $
  scrollBehavior(to) {
    if (to.hash) {
      return window.scrollTo(0, 0)
    }
    return window.scrollTo(0, 0)
  }
});

// router gards
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
});

router.afterEach((/* to, from */) => {
  NProgress.done()
});

export default router
