import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base precisa ser o nome do repositório para o GitHub Pages achar os arquivos.
// O site é servido em https://<usuario>.github.io/foco.com/.
// Se você usar um domínio próprio (CNAME) ou renomear o repo, ajuste aqui.
export default defineConfig({
  base: '/foco.com/',
  plugins: [react()],
})
