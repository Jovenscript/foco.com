// Camada de dados do Foco — tudo salvo no aparelho (localStorage).
import { useState, useEffect } from 'react'

const KEY = 'foco.dados.v1'

const SEED = {
  perfil: { nome: 'Marlon' },
  itens: [
    { id: 1, titulo: 'Academia',  hora: '10:00', duracaoMin: 80,  custo: 0,   icone: 'dumbbell', feito: false },
    { id: 2, titulo: 'Farmácia',  hora: '11:45', duracaoMin: 20,  custo: 45,  icone: 'pill',     feito: false },
    { id: 3, titulo: 'Turno WEG', hora: '14:00', duracaoMin: 600, custo: 0,   icone: 'wrench',   feito: false },
    { id: 4, titulo: 'Energia',   hora: '23:00', duracaoMin: 0,   custo: 210, icone: 'bolt',     feito: false, conta: true },
  ],
}

const clone = (o) => JSON.parse(JSON.stringify(o))

export function carregar(){
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  salvar(SEED)
  return clone(SEED)
}
export function salvar(d){ try { localStorage.setItem(KEY, JSON.stringify(d)) } catch (e) {} }
export function resetar(){ try { localStorage.removeItem(KEY) } catch (e) {}; return carregar() }

export function useDados(){
  const [dados, setDados] = useState(carregar)
  useEffect(() => { salvar(dados) }, [dados])
  return [dados, setDados]
}

// ---- helpers de tempo/dinheiro ----
export const horaMin = (h) => { const [a,b] = h.split(':').map(Number); return a*60 + (b||0) }
export const agoraMin = () => { const d = new Date(); return d.getHours()*60 + d.getMinutes() }

export function fmtDur(min){
  if (!min) return '—'
  const h = Math.floor(min/60), m = min%60
  if (h && m) return `${h}h${String(m).padStart(2,'0')}`
  if (h) return `${h}h`
  return `${m} min`
}
export function fmtR(v){
  if (v == null || v === '' || Number(v) === 0) return '—'
  return 'R$ ' + Number(v).toLocaleString('pt-BR')
}

// próximo movimento: item aberto (não feito, não conta), o mais próximo do horário atual
export function proximo(itens){
  const abertos = itens.filter(i => !i.feito && !i.conta).sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))
  const ag = agoraMin()
  return abertos.find(i => horaMin(i.hora) >= ag) || abertos[0] || null
}
