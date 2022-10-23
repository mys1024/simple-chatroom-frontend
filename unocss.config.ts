import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  shortcuts: {
    'btn-text': 'px-4 py-1 rounded outline-none text-dark bg-white hover:bg-sky active:bg-red transition-background-color',
    'input-text': 'px-2 py-1 rounded outline-none text-dark bg-white border-3 border-#00000000 focus:border-sky transition-border-color',
  },
})
