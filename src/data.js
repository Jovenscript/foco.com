// Camada de dados do Foco — tudo salvo no aparelho (localStorage).
import { useState, useEffect } from 'react'

const KEY = 'foco.dados.v2' // v2: novo formato (rotina + contas separadas)

const SEED = {
  perfil: { nome: 'Marlon' },
  rotina: [
    { id: 1, titulo: 'Academia',  hora: '10:00', duracaoMin: 80,  icone: 'dumbbell', feito: false },
    { id: 2, titulo: 'Farmácia',  hora: '11:45', duracaoMin: 20,  icone: 'pill',     feito: false },
    { id: 3, titulo: 'Turno WEG', hora: '14:00', duracaoMin: 600, icone: 'wrench',   feito: false },
  ],
  contas: [
    { id: 1, nome: 'Energia',  valor: 210, dia: 10, pago: false, recorrente: true, icone: 'bolt' },
    { id: 2, nome: 'Internet', valor: 120, dia: 15, pago: false, recorrente: true, icone: 'wifi' },
    { id: 3, nome: 'Cartão',   valor: 640, dia: 20, pago: false, recorrente: true, icone: 'card' },
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

// ---- helpers ----
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
  return 'R$ ' + Number(v).toLocaleString('pt-BR')
}

// próximo compromisso da rotina (não feito, mais perto do horário)
export function proximo(rotina){
  const abertos = rotina.filter(i => !i.feito).sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))
  const ag = agoraMin()
  return abertos.find(i => horaMin(i.hora) >= ag) || abertos[0] || null
}

// status de uma conta: 'paga' | 'vencida' | 'hoje' | 'pendente'
export function statusConta(c){
  if (c.pago) return 'paga'
  const h = diaHoje()
  if (c.dia < h) return 'vencida'
  if (c.dia === h) return 'hoje'
  return 'pendente'
}

// resumo financeiro do mês
export function resumoContas(contas){
  const total = contas.reduce((s,c)=>s+(Number(c.valor)||0), 0)
  const pago  = contas.filter(c=>c.pago).reduce((s,c)=>s+(Number(c.valor)||0), 0)
  const falta = total - pago
  const h = diaHoje()
  const pendentes = contas.filter(c=>!c.pago).sort((a,b)=>a.dia-b.dia)
  const proxima = pendentes.find(c=>c.dia>=h) || pendentes[0] || null
  return { total, pago, falta, proxima }
}
