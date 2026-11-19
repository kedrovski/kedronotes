// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  modules: ['@pinia/nuxt'],

  css: ['~/assets/styles/main.scss'],

  typescript: {
    strict: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Kedronotes',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Заметки со списками задач' },
      ],
    },
  },
})
