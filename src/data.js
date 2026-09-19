// Camada de dados do Foco — salvo no aparelho (localStorage).
import { useState, useEffect } from 'react'

const KEY = 'foco.dados.v3' // v3: dados reais + reservas + vencimento opcional

const SEED = {
  perfil: { nome: 'Marlon' },
  rotina: [
    { id: 1, titulo: 'Academia',       hora: '07:30', duracaoMin: 90,  icone: 'dumbbell', feito: false },
    { id: 2, titulo: 'Estudar ADS',    hora: '09:30', duracaoMin: 150, icone: 'book',     feito: false },
    { id: 3, titulo: 'Almoço',         hora: '12:00', duracaoMin: 60,  icone: 'clock',    feito: false },
    { id: 4, titulo: 'Sair pro WEG',   hora: '13:15', duracaoMin: 0,   icone: 'wrench',   feito: false },
    { id: 5, titulo: 'Turno WEG',      hora: '14:00', duracaoMin: 600, icone: 'wrench',   feito: false },
    { id: 6, titulo: 'Remédio da Carol',hora: '20:00',duracaoMin: 5,   icone: 'pill',     feito: false },
    { id: 7, titulo: 'Dormir',         hora: '01:00', duracaoMin: 0,   icone: 'moon',     feito: false },
  ],
  // Contas com vencimento (dia pode ser null = ainda não definido)
  contas: [
    { id: 1,  nome: 'Financiamento',        valor: 1580,  dia: null, pago: false, icone: 'home' },
    { id: 2,  nome: 'Condomínio',           valor: 390,   dia: null, pago: false, icone: 'home' },
    { id: 3,  nome: 'Plano de saúde',       valor: 320,   dia: null, pago: false, icone: 'pill' },
    { id: 4,  nome: 'Internet + cel Carol', valor: 155,   dia: null, pago: false, icone: 'wifi' },
    { id: 5,  nome: 'Energia',              valor: 155,   dia: null, pago: false, icone: 'bolt' },
    { id: 6,  nome: 'Celular Marlon',       valor: 89,    dia: null, pago: false, icone: 'card' },
    { id: 7,  nome: 'TV',                   valor: 35,    dia: null, pago: false, icone: 'tv' },
    { id: 8,  nome: 'Spotify',              valor: 25.80, dia: null, pago: false, icone: 'card' },
    { id: 9,  nome: 'Dízimo',               valor: 75,    dia: null, pago: false, icone: 'card' },
    { id: 10, nome: 'Academia',             valor: 119,   dia: null, pago: false, icone: 'dumbbell' },
    { id: 11, nome: 'Cartão (até abril)',   valor: 248,   dia: null, pago: false, icone: 'card' },
  ],
  // Reservas do mês (envelopes) — metas, sem vencimento
  reservas: [
    { id: 1, nome: 'Compras do mês',   meta: 1200, icone: 'cart' },
    { id: 2, nome: 'Combustível',      meta: 500,  icone: 'fuel' },
    { id: 3, nome: 'Delivery / lazer', meta: 300,  icone: 'clock' },
    { id: 4, nome: 'Remédios',         meta: 180,  icone: 'pill' },
    { id: 5, nome: 'Unha da Carol',    meta: 120,  icone: 'spark' },
    { id: 6, nome: 'Cabelo',           meta: 90,   icone: 'spark' },
    { id: 7, nome: 'Óleo moto (3/3m)', meta: 23,   icone: 'wrench' },
  ],
}

const clone = (o) => JSON.parse(JSON.stringify(o))

export function carregar(){
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) } catch (e) {}
  salvar(SEED); return clone(SEED)
}
export function salvar(d){ try { localStorage.setItem(KEY, JSON.stringify(d)) } catch (e) {} }
export function resetar(){ try { localStorage.removeItem(KEY) } catch (e) {}; return carregar() }

export function useDados(){
  const [dados, setDados] = useState(carregar)
  useEffect(() => { salvar(dados) }, [dados])
  return [dados, setDados]
}

export const horaMin = (h) => { const [a,b] = h.split(':').map(Number); return a*60 + (b||0) }
export const agoraMin = () => { const d = new Date(); return d.getHours()*60 + d.getMinutes() }
export const diaHoje = () => new Date().getDate()

export function fmtDur(min){
  if (!min) return '—'
  const h = Math.floor(min/60), m = min%60
  if (h && m) return `${h}h${String(m).padStart(2,'0')}`
  if (h) return `${h}h`
  return `${m} min`
}
export function fmtR(v){
  if (v == null || v === '') return 'R$ 0'
  const n = Number(v)
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
}

export function proximo(rotina){
  const abertos = rotina.filter(i => !i.feito).sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))
  const ag = agoraMin()
  return abertos.find(i => horaMin(i.hora) >= ag) || abertos[0] || null
}

// status de conta: 'paga' | 'vencida' | 'hoje' | 'pendente' | 'semdata'
export function statusConta(c){
  if (c.pago) return 'paga'
  if (c.dia == null) return 'semdata'
  const h = diaHoje()
  if (c.dia < h) return 'vencida'
  if (c.dia === h) return 'hoje'
  return 'pendente'
}

export function resumoFinanceiro(dados){
  const contasTotal = dados.contas.reduce((s,c)=>s+(Number(c.valor)||0), 0)
  const pago  = dados.contas.filter(c=>c.pago).reduce((s,c)=>s+(Number(c.valor)||0), 0)
  const falta = contasTotal - pago
  const reservasTotal = dados.reservas.reduce((s,r)=>s+(Number(r.meta)||0), 0)
  const custoVida = contasTotal + reservasTotal
  const h = diaHoje()
  const comData = dados.contas.filter(c=>!c.pago && c.dia != null).sort((a,b)=>a.dia-b.dia)
  const proxima = comData.find(c=>c.dia>=h) || comData[0] || null
  return { contasTotal, pago, falta, reservasTotal, custoVida, proxima }
}
