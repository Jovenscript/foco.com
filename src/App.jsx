import React, { useState } from 'react'
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useDados, resetar, fmtDur, fmtR, proximo, horaMin, agoraMin, statusConta, resumoFinanceiro } from './data.js'

/* ---------------- Ícones ---------------- */
function Icon({ n, s = 18 }){
  const p = { width:s, height:s, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor',
    strokeWidth:1.6, strokeLinecap:'round', strokeLinejoin:'round' }
  const d = {
    dumbbell:<path d="M6.5 6.5v11M17.5 6.5v11M4 9.5v5M20 9.5v5M6.5 12h11"/>,
    pill:<><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/></>,
    wrench:<path d="M14.5 5.5a3.5 3.5 0 0 0-4.6 4.3L4 15.7 6.3 18l5.9-5.9a3.5 3.5 0 0 0 4.3-4.6l-2.1 2.1-1.9-.5-.5-1.9z"/>,
    bolt:<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>,
    wifi:<><path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0"/><circle cx="12" cy="19" r="1"/></>,
    card:<><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></>,
    home:<><path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/></>,
    tv:<><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 20h8"/></>,
    cart:<><path d="M4 5h2l2 10h10l2-7H7"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></>,
    fuel:<><rect x="4" y="4" width="9" height="16" rx="1.5"/><path d="M13 9h3l2 2v6a2 2 0 0 1-4 0v-3h-1"/></>,
    book:<><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 16h13"/></>,
    moon:<path d="M20 14a8 8 0 1 1-9-10 6 6 0 0 0 9 10z"/>,
    clock:<><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
    play:<path d="M8 5v14l11-7z"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    trash:<><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></>,
    check:<path d="M5 12.5 10 17l9-10"/>,
    chevron:<path d="M6 9l6 6 6-6"/>,
    list:<><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="17" cy="18" r="2.4"/></>,
    coin:<><circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M9.5 10h3.2a1.6 1.6 0 0 1 0 3.2H10"/></>,
    spark:<path d="M12 4v16M4 12h16M7 7l10 10M17 7 7 17"/>,
    user:<><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.4-3.5 4.6-4.5 7-4.5s5.6 1 7 4.5"/></>,
  }
  return <svg {...p}>{d[n] || null}</svg>
}

/* ---------------- HOJE ---------------- */
function Hoje({ dados, setDados }){
  const nav = useNavigate()
  const prox = proximo(dados.rotina)
  const abertos = dados.rotina.filter(i => !i.feito && i.id !== (prox && prox.id)).sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))
  const iniciar = () => { if (!prox) return
    setDados(d => ({ ...d, rotina: d.rotina.map(i => i.id === prox.id ? { ...i, feito:true } : i) })) }
  const adiar = () => { if (!prox) return
    setDados(d => ({ ...d, rotina: d.rotina.map(i => {
      if (i.id !== prox.id) return i
      const m = Math.min(horaMin(i.hora) + 30, 23*60+59)
      return { ...i, hora: `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}` }
    }) }))
  }
  const diff = prox ? horaMin(prox.hora) - agoraMin() : 0
  const quando = prox ? (diff > 0 ? `começa em ${fmtDur(diff)}` : 'começa agora') : ''
  return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className="mono" style={{ fontSize:12, color:'var(--dim)', letterSpacing:1 }}>
          {new Date().toLocaleDateString('pt-BR',{weekday:'short', day:'2-digit', month:'short'})}</span>
        <span style={{ fontSize:10, letterSpacing:1, color:'var(--dim2)' }}>{abertos.length + (prox?1:0)} guardados</span>
      </div>
      {prox ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'12px 6px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, letterSpacing:2.4, color:'var(--dim)', marginBottom:26 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--red)' }}/> AGORA</div>
          <div style={{ width:58, height:58, border:'1px solid var(--line)', borderRadius:15, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
            <Icon n={prox.icone} s={26}/></div>
          <div style={{ fontSize:38, fontWeight:600, letterSpacing:-1.2, lineHeight:1 }}>{prox.titulo}</div>
          <div className="mono" style={{ fontSize:14, color:'var(--dim)', marginTop:16 }}>{prox.hora} · {quando}</div>
          {prox.duracaoMin > 0 && (
            <div style={{ fontSize:14, color:'var(--dim)', marginTop:20, maxWidth:250, lineHeight:1.6 }}>
              Alvo de {fmtDur(prox.duracaoMin)}. <b style={{ color:'var(--bone)', fontWeight:500 }}>O resto fica guardado</b> até a sua hora.</div>
          )}
          <button className="btn btn-bone" style={{ marginTop:36, width:'100%', maxWidth:290, height:56 }} onClick={iniciar}>
            <Icon n="play" s={16}/> Iniciar</button>
          <button className="btn-ghost" style={{ marginTop:14 }} onClick={adiar}>agora não</button>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center' }}>
          <div style={{ fontSize:26, fontWeight:600, letterSpacing:-.5 }}>Tudo feito por hoje.</div>
          <div style={{ fontSize:14, color:'var(--dim)', marginTop:12 }}>Respira. Você cumpriu o dia.</div></div>
      )}
      {abertos.length > 0 && (
        <div style={{ paddingTop:20, borderTop:'1px solid var(--line-soft)' }}>
          <div style={{ fontSize:9, letterSpacing:2, color:'var(--dim2)', textAlign:'center', marginBottom:12 }}>DEPOIS</div>
          <div style={{ display:'flex', justifyContent:'center', gap:8, fontSize:12, color:'var(--dim2)', flexWrap:'wrap' }}>
            {abertos.slice(0,3).map(i => (<span key={i.id}><span className="mono" style={{ color:'#4E4A44' }}>{i.hora}</span> {i.titulo}</span>))}</div>
          <div onClick={()=>nav('/agenda')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:11, color:'var(--dim2)', marginTop:16, cursor:'pointer' }}>
            ver a agenda <Icon n="chevron" s={13}/></div>
        </div>
      )}
    </div>
  )
}

/* ---------------- AGENDA ---------------- */
function Agenda({ dados, setDados }){
  const vazio = { titulo:'', hora:'08:00', duracaoMin:60, icone:'clock' }
  const [f, setF] = useState(vazio)
  const set = (k,v) => setF(s => ({ ...s, [k]:v }))
  const add = () => { if (!f.titulo.trim()) return
    setDados(d => ({ ...d, rotina: [...d.rotina, { ...f, id: Date.now(), duracaoMin: Number(f.duracaoMin)||0, feito:false }] })); setF(vazio) }
  const del = (id) => setDados(d => ({ ...d, rotina: d.rotina.filter(i => i.id !== id) }))
  const toggle = (id) => setDados(d => ({ ...d, rotina: d.rotina.map(i => i.id===id?{...i, feito:!i.feito}:i) }))
  const editHora = (i) => { const v = window.prompt('Horário (HH:MM):', i.hora); if (!v) return
    setDados(d => ({ ...d, rotina: d.rotina.map(x => x.id===i.id?{...x, hora:v}:x) })) }
  const itens = [...dados.rotina].sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))
  return (
    <div>
      <div className="hdr"><div><h1>Agenda</h1><div className="sub">sua rotina · toque no horário p/ editar</div></div></div>
      <div className="canal"><span className="code mono">+</span> NOVO COMPROMISSO <span className="ln"/></div>
      <div className="field"><label>Título</label><input value={f.titulo} onChange={e=>set('titulo', e.target.value)} placeholder="Ex: Academia"/></div>
      <div className="grid2">
        <div className="field"><label>Hora</label><input type="time" value={f.hora} onChange={e=>set('hora', e.target.value)}/></div>
        <div className="field"><label>Duração (min)</label><input type="number" value={f.duracaoMin} onChange={e=>set('duracaoMin', e.target.value)}/></div>
      </div>
      <div className="field"><label>Tipo</label>
        <select value={f.icone} onChange={e=>set('icone', e.target.value)}>
          <option value="dumbbell">Treino</option><option value="book">Estudo</option>
          <option value="wrench">Trabalho</option><option value="pill">Saúde</option>
          <option value="moon">Sono</option><option value="clock">Geral</option>
        </select></div>
      <button className="btn btn-bone" style={{ width:'100%', marginTop:6 }} onClick={add}><Icon n="plus" s={16}/> Adicionar</button>
      <div className="canal mt"><span className="code mono">=</span> O DIA <span className="ln"/></div>
      {itens.map(i => (
        <div className="item" key={i.id}>
          <div onClick={()=>toggle(i.id)} style={{ cursor:'pointer' }} className="ico">{i.feito ? <Icon n="check" s={17}/> : <Icon n={i.icone} s={17}/>}</div>
          <div className="nm">
            <div className="t" style={ i.feito ? { color:'var(--dim2)', textDecoration:'line-through' } : {} }>{i.titulo}</div>
            <div className="s" onClick={()=>editHora(i)} style={{ cursor:'pointer' }}><span className="mono" style={{ color:'var(--bone)' }}>{i.hora}</span> · {fmtDur(i.duracaoMin)} · <span style={{ color:'var(--dim2)' }}>editar</span></div>
          </div>
          <button className="btn-ghost" onClick={()=>del(i.id)} style={{ color:'var(--dim2)' }}><Icon n="trash" s={17}/></button>
        </div>
      ))}
    </div>
  )
}

/* ---------------- CONTAS ---------------- */
function Contas({ dados, setDados }){
  const [nova, setNova] = useState(false)
  const vazio = { nome:'', valor:'', dia:'', recorrente:true, icone:'card' }
  const [f, setF] = useState(vazio)
  const set = (k,v) => setF(s => ({ ...s, [k]:v }))
  const add = () => { if (!f.nome.trim()) return
    setDados(d => ({ ...d, contas: [...d.contas, { id: Date.now(), nome:f.nome, valor:Number(f.valor)||0, dia: f.dia===''?null:Number(f.dia), pago:false, icone:f.icone }] }))
    setF(vazio); setNova(false) }
  const togglePago = (id) => setDados(d => ({ ...d, contas: d.contas.map(c => c.id===id?{...c, pago:!c.pago}:c) }))
  const del = (id) => setDados(d => ({ ...d, contas: d.contas.filter(c => c.id !== id) }))
  const editDia = (c) => { const v = window.prompt('Dia do vencimento (1-31, vazio p/ nenhum):', c.dia ?? '')
    if (v === null) return
    const dia = v.trim()==='' ? null : Math.max(1, Math.min(31, Number(v)||1))
    setDados(d => ({ ...d, contas: d.contas.map(x => x.id===c.id?{...x, dia}:x) })) }

  const r = resumoFinanceiro(dados)
  const contas = [...dados.contas].sort((a,b)=>{
    const da = a.dia==null?99:a.dia, db = b.dia==null?99:b.dia; return da-db })
  const mes = new Date().toLocaleDateString('pt-BR',{month:'long'})
  const corSt = (st) => (st==='vencida'||st==='hoje') ? 'var(--red)' : (st==='paga' ? 'var(--dim2)' : 'var(--bone)')
  const rotSt = { paga:'PAGA', vencida:'VENCIDA', hoje:'VENCE HOJE', pendente:'', semdata:'' }

  return (
    <div>
      <div className="hdr"><div><h1>Contas</h1><div className="sub">controle de {mes}</div></div></div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
        <div style={{ padding:'14px 12px', border:'1px solid var(--line)', borderRadius:12 }}>
          <div style={{ fontSize:10, color:'var(--dim)' }}>Custo de vida</div>
          <div className="mono" style={{ fontSize:16, fontWeight:600, marginTop:5 }}>{fmtR(r.custoVida)}</div></div>
        <div style={{ padding:'14px 12px', border:'1px solid var(--line)', borderRadius:12 }}>
          <div style={{ fontSize:10, color:'var(--dim)' }}>Pago</div>
          <div className="mono" style={{ fontSize:16, fontWeight:600, marginTop:5, color:'var(--dim2)' }}>{fmtR(r.pago)}</div></div>
        <div style={{ padding:'14px 12px', border:'1px solid var(--line)', borderRadius:12 }}>
          <div style={{ fontSize:10, color:'var(--dim)' }}>Falta</div>
          <div className="mono" style={{ fontSize:16, fontWeight:600, marginTop:5, color: r.falta>0?'var(--red)':'var(--dim2)' }}>{fmtR(r.falta)}</div></div>
      </div>
      {r.proxima && (<div style={{ fontSize:11.5, color:'var(--dim)', marginTop:12, textAlign:'center' }}>
        Próxima: <b style={{ color:'var(--bone)' }}>{r.proxima.nome}</b> · dia {r.proxima.dia}</div>)}

      <div className="canal mt"><span className="code mono">$</span> CONTAS DO MÊS <span className="ln"/></div>
      {contas.map(c => { const st = statusConta(c)
        return (
          <div className="item" key={c.id}>
            <div onClick={()=>togglePago(c.id)} title="marcar paga" style={{ cursor:'pointer' }} className={`ico ${(st==='vencida'||st==='hoje')?'red':''}`}>
              {c.pago ? <Icon n="check" s={17}/> : <Icon n={c.icone} s={17}/>}</div>
            <div className="nm">
              <div className="t" style={ c.pago ? { color:'var(--dim2)', textDecoration:'line-through' } : {} }>{c.nome}</div>
              <div className="s" onClick={()=>editDia(c)} style={{ cursor:'pointer' }}>
                {c.dia!=null ? <>vence dia {c.dia}</> : <span style={{ color:'var(--dim2)' }}>definir vencimento</span>} · <span style={{ color:'var(--dim2)' }}>editar</span></div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div className="mono" style={{ fontSize:15, fontWeight:600, color:corSt(st) }}>{fmtR(c.valor)}</div>
              {rotSt[st] && <div className="mono" style={{ fontSize:8.5, letterSpacing:1, color:corSt(st), marginTop:2 }}>{rotSt[st]}</div>}</div>
            <button className="btn-ghost" onClick={()=>del(c.id)} style={{ color:'var(--dim2)', marginLeft:8 }}><Icon n="trash" s={16}/></button>
          </div>
        )})}

      {nova ? (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--line)' }}>
          <div className="field"><label>Nome</label><input value={f.nome} onChange={e=>set('nome', e.target.value)} placeholder="Ex: Água"/></div>
          <div className="grid2">
            <div className="field"><label>Valor R$</label><input type="number" value={f.valor} onChange={e=>set('valor', e.target.value)}/></div>
            <div className="field"><label>Dia (opcional)</label><input type="number" min="1" max="31" value={f.dia} onChange={e=>set('dia', e.target.value)}/></div>
          </div>
          <button className="btn btn-bone" style={{ width:'100%' }} onClick={add}><Icon n="plus" s={16}/> Salvar</button>
          <button className="btn-ghost" style={{ width:'100%', marginTop:10 }} onClick={()=>setNova(false)}>cancelar</button>
        </div>
      ) : (<button className="btn btn-line" style={{ width:'100%', marginTop:14 }} onClick={()=>setNova(true)}><Icon n="plus" s={16}/> Nova conta</button>)}

      {/* RESERVAS DO MÊS */}
      <div className="canal mt"><span className="code mono">#</span> RESERVAS DO MÊS <span className="ln"/></div>
      <div style={{ fontSize:11, color:'var(--dim2)', marginBottom:8 }}>metas mensais (sem vencimento) — total {fmtR(r.reservasTotal)}</div>
      {dados.reservas.map(rv => (
        <div className="item" key={rv.id}>
          <div className="ico"><Icon n={rv.icone} s={17}/></div>
          <div className="nm"><div className="t">{rv.nome}</div><div className="s">meta do mês</div></div>
          <div className="mono" style={{ fontSize:15, fontWeight:600 }}>{fmtR(rv.meta)}</div>
        </div>
      ))}
    </div>
  )
}

/* ---------------- COPILOTO ---------------- */
function Copiloto({ dados }){
  const prox = proximo(dados.rotina)
  const feitos = dados.rotina.filter(i=>i.feito).length
  const total = dados.rotina.length
  const r = resumoFinanceiro(dados)
  return (
    <div>
      <div className="hdr"><div><h1>Copiloto</h1><div className="sub">o que importa agora</div></div></div>
      <div style={{ padding:'18px 0', borderBottom:'1px solid var(--line)' }}>
        <div style={{ fontSize:11, letterSpacing:1, color:'var(--dim)', marginBottom:8 }}>SEU PRÓXIMO MOVIMENTO</div>
        {prox ? (<div style={{ fontSize:24, fontWeight:600, letterSpacing:-.5 }}>{prox.titulo} <span className="mono" style={{ fontSize:15, color:'var(--red)' }}>{prox.hora}</span></div>)
          : <div style={{ fontSize:20, color:'var(--dim)' }}>Nada pendente. Dia limpo.</div>}
      </div>
      <div style={{ padding:'18px 0', borderBottom:'1px solid var(--line)' }}>
        <div style={{ fontSize:11, letterSpacing:1, color:'var(--dim)', marginBottom:8 }}>PRÓXIMA CONTA</div>
        {r.proxima ? (<div style={{ fontSize:24, fontWeight:600, letterSpacing:-.5 }}>{r.proxima.nome} <span className="mono" style={{ fontSize:15, color:'var(--red)' }}>dia {r.proxima.dia}</span> <span className="mono" style={{ fontSize:15, color:'var(--dim)' }}>{fmtR(r.proxima.valor)}</span></div>)
          : <div style={{ fontSize:16, color:'var(--dim)' }}>Defina os vencimentos na aba Contas.</div>}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16 }}>
        <div style={{ padding:16, border:'1px solid var(--line)', borderRadius:12 }}>
          <div style={{ fontSize:11, color:'var(--dim)' }}>Rotina concluída</div>
          <div className="mono" style={{ fontSize:26, fontWeight:600, marginTop:6 }}>{feitos}/{total}</div></div>
        <div style={{ padding:16, border:'1px solid var(--line)', borderRadius:12 }}>
          <div style={{ fontSize:11, color:'var(--dim)' }}>Falta pagar</div>
          <div className="mono" style={{ fontSize:26, fontWeight:600, marginTop:6, color: r.falta>0?'var(--red)':'var(--dim2)' }}>{fmtR(r.falta)}</div></div>
      </div>
    </div>
  )
}

/* ---------------- PERFIL ---------------- */
function Perfil({ dados, setDados }){
  const reset = () => { if (window.confirm('Apagar tudo e voltar aos dados de exemplo?')) setDados(resetar()) }
  return (
    <div>
      <div className="hdr"><div><h1>Perfil</h1><div className="sub">ajustes</div></div></div>
      <div className="field"><label>Seu nome</label>
        <input value={dados.perfil.nome} onChange={e=>setDados(d=>({ ...d, perfil:{ ...d.perfil, nome:e.target.value } }))}/></div>
      <div className="canal mt"><span className="code mono">!</span> DADOS <span className="ln"/></div>
      <button className="btn btn-red" style={{ width:'100%' }} onClick={reset}>Resetar para o exemplo</button>
      <div style={{ fontSize:11, color:'var(--dim2)', marginTop:20, textAlign:'center' }} className="mono">FOCO · v1.2</div>
    </div>
  )
}

/* ---------------- NAV ---------------- */
function BottomNav(){
  const itens = [['/', 'home', 'Hoje'], ['/agenda', 'list', 'Agenda'], ['/contas', 'coin', 'Contas'], ['/copiloto', 'spark', 'Copiloto'], ['/perfil', 'user', 'Perfil']]
  return (
    <nav className="nav">
      {itens.map(([to, ico, label]) => (
        <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => 'navitem' + (isActive ? ' on' : '')}>
          <Icon n={ico} s={21}/> {label}</NavLink>
      ))}
    </nav>
  )
}

/* ---------------- APP ---------------- */
export default function App(){
  const [dados, setDados] = useDados()
  return (
    <HashRouter>
      <div className="shell">
        <div className="content">
          <Routes>
            <Route path="/" element={<Hoje dados={dados} setDados={setDados} />} />
            <Route path="/agenda" element={<Agenda dados={dados} setDados={setDados} />} />
            <Route path="/contas" element={<Contas dados={dados} setDados={setDados} />} />
            <Route path="/copiloto" element={<Copiloto dados={dados} />} />
            <Route path="/perfil" element={<Perfil dados={dados} setDados={setDados} />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
