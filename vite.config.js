import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base precisa ser o nome do repositório para o GitHub Pages achar os arquivos.
// Se você criar o repo com outro nome, troque '/foco/' pelo nome do repo.
export default defineConfig({
  base: '/foco/',
  plugins: [react()],
})
