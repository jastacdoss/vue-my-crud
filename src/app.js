/**
 * Created by: Jason Doss
 * https://medium.com/the-web-tub/creating-your-first-vue-js-pwa-project-22f7c552fb34
 */
import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/scss/app.scss';

Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
    el: '#app',
    components: { App },
    template: '<App/>'
})