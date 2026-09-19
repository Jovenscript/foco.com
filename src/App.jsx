import React, { useState } from 'react'
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useDados, resetar, fmtDur, fmtR, proximo, horaMin, agoraMin } from './data.js'

/* ---------------- Ícones ---------------- */
function Icon({ n, s = 18 }){
  const p = { width:s, height:s, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor',
    strokeWidth:1.6, strokeLinecap:'round', strokeLinejoin:'round' }
  const d = {
    dumbbell:<path d="M6.5 6.5v11M17.5 6.5v11M4 9.5v5M20 9.5v5M6.5 12h11"/>,
    pill:<><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/></>,
    wrench:<path d="M14.5 5.5a3.5 3.5 0 0 0-4.6 4.3L4 15.7 6.3 18l5.9-5.9a3.5 3.5 0 0 0 4.3-4.6l-2.1 2.1-1.9-.5-.5-1.9z"/>,
    bolt:<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>,
    clock:<><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
    play:<path d="M8 5v14l11-7z"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    trash:<><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></>,
    chevron:<path d="M6 9l6 6 6-6"/>,
    home:<><path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/></>,
    list:<><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="17" cy="18" r="2.4"/></>,
    coin:<><circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M9.5 10h3.2a1.6 1.6 0 0 1 0 3.2H10"/></>,
    spark:<path d="M12 4v16M4 12h16M7 7l10 10M17 7 7 17"/>,
    user:<><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.4-3.5 4.6-4.5 7-4.5s5.6 1 7 4.5"/></>,
  }
  return <svg {...p}>{d[n] || null}</svg>
}

/* ---------------- HOJE (Conceito B) ---------------- */
function Hoje({ dados, setDados }){
  const nav = useNavigate()
  const prox = proximo(dados.itens)
  const abertos = dados.itens.filter(i => !i.feito && !i.conta && i.id !== (prox && prox.id))
    .sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))

  const iniciar = () => { if (!prox) return
    setDados(d => ({ ...d, itens: d.itens.map(i => i.id === prox.id ? { ...i, feito:true } : i) })) }
  const adiar = () => { if (!prox) return
    setDados(d => ({ ...d, itens: d.itens.map(i => {
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
          {new Date().toLocaleDateString('pt-BR',{weekday:'short', day:'2-digit', month:'short'})}
        </span>
        <span style={{ fontSize:10, letterSpacing:1, color:'var(--dim2)' }}>
          {abertos.length + (prox?1:0)} guardados
        </span>
      </div>

      {prox ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'12px 6px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, letterSpacing:2.4, color:'var(--dim)', marginBottom:26 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--red)' }}/> AGORA
          </div>
          <div style={{ width:58, height:58, border:'1px solid var(--line)', borderRadius:15, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
            <Icon n={prox.icone} s={26}/>
          </div>
          <div style={{ fontSize:38, fontWeight:600, letterSpacing:-1.2, lineHeight:1 }}>{prox.titulo}</div>
          <div className="mono" style={{ fontSize:14, color:'var(--dim)', marginTop:16 }}>
            {prox.hora} · {quando}
          </div>
          {prox.duracaoMin > 0 && (
            <div style={{ fontSize:14, color:'var(--dim)', marginTop:20, maxWidth:250, lineHeight:1.6 }}>
              Alvo de {fmtDur(prox.duracaoMin)}. <b style={{ color:'var(--bone)', fontWeight:500 }}>O resto fica guardado</b> até a sua hora.
            </div>
          )}
          <button className="btn btn-bone" style={{ marginTop:36, width:'100%', maxWidth:290, height:56 }} onClick={iniciar}>
            <Icon n="play" s={16}/> Iniciar
          </button>
          <button className="btn-ghost" style={{ marginTop:14 }} onClick={adiar}>agora não</button>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center' }}>
          <div style={{ fontSize:26, fontWeight:600, letterSpacing:-.5 }}>Tudo feito por hoje.</div>
          <div style={{ fontSize:14, color:'var(--dim)', marginTop:12 }}>Respira. Você cumpriu o dia.</div>
        </div>
      )}

      {abertos.length > 0 && (
        <div style={{ paddingTop:20, borderTop:'1px solid var(--line-soft)' }}>
          <div style={{ fontSize:9, letterSpacing:2, color:'var(--dim2)', textAlign:'center', marginBottom:12 }}>DEPOIS</div>
          <div style={{ display:'flex', justifyContent:'center', gap:8, fontSize:12, color:'var(--dim2)', flexWrap:'wrap' }}>
            {abertos.slice(0,3).map(i => (
              <span key={i.id}><span className="mono" style={{ color:'#4E4A44' }}>{i.hora}</span> {i.titulo}</span>
            ))}
          </div>
          <div onClick={()=>nav('/extrato')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:11, color:'var(--dim2)', marginTop:16, cursor:'pointer' }}>
            ver o dia inteiro <Icon n="chevron" s={13}/>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- ALOCAR ---------------- */
function Alocar({ dados, setDados }){
  const vazio = { titulo:'', hora:'08:00', duracaoMin:60, custo:'', icone:'dumbbell' }
  const [f, setF] = useState(vazio)
  const set = (k,v) => setF(s => ({ ...s, [k]:v }))
  const add = () => {
    if (!f.titulo.trim()) return
    const novo = { ...f, id: Date.now(), custo: f.custo === '' ? 0 : Number(f.custo),
      duracaoMin: Number(f.duracaoMin) || 0, feito:false }
    setDados(d => ({ ...d, itens: [...d.itens, novo] }))
    setF(vazio)
  }
  const del = (id) => setDados(d => ({ ...d, itens: d.itens.filter(i => i.id !== id) }))
  const itens = [...dados.itens].sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))

  return (
    <div>
      <div className="hdr"><div><h1>Alocar</h1><div className="sub">distribua tempo e dinheiro antes</div></div></div>

      <div className="canal"><span className="code mono">+</span> NOVO BLOCO <span className="ln"/></div>
      <div className="field"><label>Título</label>
        <input value={f.titulo} onChange={e=>set('titulo', e.target.value)} placeholder="Ex: Academia"/></div>
      <div className="grid2">
        <div className="field"><label>Hora</label>
          <input type="time" value={f.hora} onChange={e=>set('hora', e.target.value)}/></div>
        <div className="field"><label>Duração (min)</label>
          <input type="number" value={f.duracaoMin} onChange={e=>set('duracaoMin', e.target.value)}/></div>
      </div>
      <div className="grid2">
        <div className="field"><label>Custo R$ (opcional)</label>
          <input type="number" value={f.custo} onChange={e=>set('custo', e.target.value)} placeholder="0"/></div>
        <div className="field"><label>Ícone</label>
          <select value={f.icone} onChange={e=>set('icone', e.target.value)}>
            <option value="dumbbell">Treino</option>
            <option value="pill">Saúde</option>
            <option value="wrench">Trabalho</option>
            <option value="bolt">Conta</option>
            <option value="clock">Geral</option>
          </select></div>
      </div>
      <button className="btn btn-bone" style={{ width:'100%', marginTop:6 }} onClick={add}>
        <Icon n="plus" s={16}/> Adicionar
      </button>

      <div className="canal mt"><span className="code mono">=</span> SEUS BLOCOS <span className="ln"/></div>
      {itens.map(i => (
        <div className="item" key={i.id}>
          <div className={`ico ${i.conta ? 'red':''}`}><Icon n={i.icone} s={17}/></div>
          <div className="nm">
            <div className="t">{i.titulo}</div>
            <div className="s"><span className="mono">{i.hora}</span> · {fmtDur(i.duracaoMin)} · {fmtR(i.custo)}</div>
          </div>
          <button className="btn-ghost" onClick={()=>del(i.id)} title="apagar" style={{ color:'var(--dim2)' }}>
            <Icon n="trash" s={17}/>
          </button>
        </div>
      ))}
    </div>
  )
}

/* ---------------- EXTRATO (duplo preço) ---------------- */
function Extrato({ dados }){
  const itens = [...dados.itens].sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))
  const tempoTotal = itens.reduce((s,i)=>s + (i.duracaoMin||0), 0)
  const dinheiro = itens.reduce((s,i)=>s + (Number(i.custo)||0), 0)

  return (
    <div>
      <div className="hdr"><div><h1>Extrato</h1><div className="sub">uma escolha, dois preços</div></div></div>

      <div style={{ display:'flex', justifyContent:'flex-end', gap:0, padding:'0 2px 8px', borderBottom:'1px solid var(--line)' }}>
        <div className="mono" style={{ width:70, textAlign:'right', fontSize:9, letterSpacing:1.2, color:'var(--dim2)' }}>TEMPO</div>
        <div className="mono" style={{ width:78, textAlign:'right', fontSize:9, letterSpacing:1.2, color:'var(--dim2)' }}>R$</div>
      </div>
      {itens.map(i => (
        <div className="item" key={i.id}>
          <div className={`ico ${i.conta ? 'red':''}`}><Icon n={i.icone} s={17}/></div>
          <div className="nm"><div className="t">{i.titulo}</div>
            <div className="s"><span className="mono">{i.hora}</span></div></div>
          <div className="mono" style={{ width:70, textAlign:'right', fontSize:14, color:'#B8B2A6' }}>{fmtDur(i.duracaoMin)}</div>
          <div className="mono" style={{ width:78, textAlign:'right', fontSize:14, color: Number(i.custo)>0 ? 'var(--red)':'var(--dim2)' }}>{fmtR(i.custo)}</div>
        </div>
      ))}

      <div style={{ display:'flex', justifyContent:'space-between', marginTop:18, paddingTop:15, borderTop:'1px solid var(--line)' }}>
        <div><div style={{ fontSize:11, color:'var(--dim)' }}>Tempo alocado</div>
          <div className="mono" style={{ fontSize:20, fontWeight:600, marginTop:4 }}>{fmtDur(tempoTotal)}</div></div>
        <div style={{ textAlign:'right' }}><div style={{ fontSize:11, color:'var(--dim)' }}>Comprometido</div>
          <div className="mono" style={{ fontSize:20, fontWeight:600, marginTop:4, color:'var(--red)' }}>{fmtR(dinheiro)}</div></div>
      </div>
    </div>
  )
}

/* ---------------- COPILOTO ---------------- */
function Copiloto({ dados }){
  const prox = proximo(dados.itens)
  const feitos = dados.itens.filter(i=>i.feito).length
  const total = dados.itens.filter(i=>!i.conta).length
  const dinheiro = dados.itens.reduce((s,i)=>s+(Number(i.custo)||0),0)

  return (
    <div>
      <div className="hdr"><div><h1>Copiloto</h1><div className="sub">o que importa agora</div></div></div>

      <div style={{ padding:'18px 0', borderBottom:'1px solid var(--line)' }}>
        <div style={{ fontSize:11, letterSpacing:1, color:'var(--dim)', marginBottom:8 }}>SEU PRÓXIMO MOVIMENTO</div>
        {prox ? (
          <div style={{ fontSize:24, fontWeight:600, letterSpacing:-.5 }}>
            {prox.titulo} <span className="mono" style={{ fontSize:15, color:'var(--red)' }}>{prox.hora}</span>
          </div>
        ) : <div style={{ fontSize:20, color:'var(--dim)' }}>Nada pendente. Dia limpo.</div>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16 }}>
        <div style={{ padding:16, border:'1px solid var(--line)', borderRadius:12 }}>
          <div style={{ fontSize:11, color:'var(--dim)' }}>Concluídos hoje</div>
          <div className="mono" style={{ fontSize:26, fontWeight:600, marginTop:6 }}>{feitos}/{total}</div>
        </div>
        <div style={{ padding:16, border:'1px solid var(--line)', borderRadius:12 }}>
          <div style={{ fontSize:11, color:'var(--dim)' }}>Comprometido</div>
          <div className="mono" style={{ fontSize:26, fontWeight:600, marginTop:6, color:'var(--red)' }}>{fmtR(dinheiro)}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- PERFIL ---------------- */
function Perfil({ dados, setDados }){
  const reset = () => {
    if (window.confirm('Apagar todos os dados e voltar ao exemplo inicial?')) {
      const novo = resetar(); setDados(novo)
    }
  }
  return (
    <div>
      <div className="hdr"><div><h1>Perfil</h1><div className="sub">ajustes</div></div></div>
      <div className="field"><label>Seu nome</label>
        <input value={dados.perfil.nome}
          onChange={e=>setDados(d=>({ ...d, perfil:{ ...d.perfil, nome:e.target.value } }))}/></div>

      <div className="canal mt"><span className="code mono">!</span> DADOS <span className="ln"/></div>
      <button className="btn btn-red" style={{ width:'100%' }} onClick={reset}>Resetar para o exemplo</button>
      <div style={{ fontSize:11, color:'var(--dim2)', marginTop:20, textAlign:'center' }} className="mono">FOCO · v1.0</div>
    </div>
  )
}

/* ---------------- NAV ---------------- */
function BottomNav(){
  const itens = [
    ['/', 'home', 'Hoje'],
    ['/alocar', 'list', 'Alocar'],
    ['/extrato', 'coin', 'Extrato'],
    ['/copiloto', 'spark', 'Copiloto'],
    ['/perfil', 'user', 'Perfil'],
  ]
  return (
    <nav className="nav">
      {itens.map(([to, ico, label]) => (
        <NavLink key={to} to={to} end={to === '/'}
          className={({isActive}) => 'navitem' + (isActive ? ' on' : '')}>
          <Icon n={ico} s={21}/> {label}
        </NavLink>
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
            <Route path="/alocar" element={<Alocar dados={dados} setDados={setDados} />} />
            <Route path="/extrato" element={<Extrato dados={dados} />} />
            <Route path="/copiloto" element={<Copiloto dados={dados} />} />
            <Route path="/perfil" element={<Perfil dados={dados} setDados={setDados} />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
