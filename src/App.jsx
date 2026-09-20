import React, { useState, useEffect, useRef } from 'react'
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useDados, resetar, salvar, fmtDur, fmtR, proximo, horaMin, agoraMin, statusConta, resumo, eventosOrdenados } from './data.js'

function Icon({ n, s=18 }){
  const p={ width:s, height:s, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.5, strokeLinecap:'round', strokeLinejoin:'round' }
  const d={
    dumbbell:<path d="M6.5 6.5v11M17.5 6.5v11M4 9.5v5M20 9.5v5M6.5 12h11"/>,
    book:<><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 16h13"/></>,
    meal:<><path d="M7 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3M9 12v9M17 3c-1.5 1-2.5 3-2.5 6s1 4 2.5 4v8"/></>,
    wrench:<path d="M14.5 5.5a3.5 3.5 0 0 0-4.6 4.3L4 15.7 6.3 18l5.9-5.9a3.5 3.5 0 0 0 4.3-4.6l-2.1 2.1-1.9-.5-.5-1.9z"/>,
    pill:<><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/></>,
    moon:<path d="M20 14a8 8 0 1 1-9-10 6 6 0 0 0 9 10z"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></>,
    bolt:<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>,
    home:<><path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/></>,
    wifi:<><path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0"/><circle cx="12" cy="19" r="1"/></>,
    card:<><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></>,
    tv:<><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 20h8"/></>,
    cart:<><path d="M4 5h2l2 10h10l2-7H7"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></>,
    fuel:<><rect x="4" y="4" width="9" height="16" rx="1.5"/><path d="M13 9h3l2 2v6a2 2 0 0 1-4 0v-3h-1"/></>,
    wallet:<><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M16 12h3"/></>,
    cal:<><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M4 9h16M8 3v4M16 3v4"/></>,
    spark:<path d="M12 4v16M4 12h16M7 7l10 10M17 7 7 17"/>,
    user:<><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.4-3.5 4.6-4.5 7-4.5s5.6 1 7 4.5"/></>,
    check:<path d="M5 12.5 10 17l9-10"/>, plus:<path d="M12 5v14M5 12h14"/>,
    trash:<><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></>,
    up:<path d="M12 19V5M6 11l6-6 6 6"/>, down:<path d="M12 5v14M6 13l6 6 6-6"/>, star:<path d="M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z"/>,
    send:<path d="M4 12l16-8-6 16-3-7-7-1z"/>,
  }
  return <svg {...p}>{d[n]||null}</svg>
}

function useCountUp(target, dur, start){
  const [v,setV]=useState(0)
  useEffect(()=>{ if(!start) return; let raf,t0; const step=t=>{ if(!t0)t0=t; const p=Math.min((t-t0)/dur,1); setV(target*(1-Math.pow(1-p,3))); if(p<1) raf=requestAnimationFrame(step) }; raf=requestAnimationFrame(step); return ()=>cancelAnimationFrame(raf) },[target,dur,start])
  return v
}

/* trajetória com inércia (deslize suave) */
function Trajetoria({ rotina, toggle }){
  const ref=useRef(null)
  const s=useRef({down:false,startX:0,startScroll:0,lastX:0,lastT:0,vel:0,raf:0,moved:false})
  const stop=()=>{ if(s.current.raf){ cancelAnimationFrame(s.current.raf); s.current.raf=0 } }
  const onDown=e=>{ stop(); const x=e.pageX??e.touches[0].pageX; s.current={...s.current,down:true,startX:x,startScroll:ref.current.scrollLeft,lastX:x,lastT:performance.now(),vel:0,moved:false}; ref.current.classList.add('drag') }
  const onMove=e=>{ const c=s.current; if(!c.down) return; const x=e.pageX??e.touches[0].pageX; if(Math.abs(x-c.startX)>3) c.moved=true; ref.current.scrollLeft=c.startScroll-(x-c.startX); const now=performance.now(); const dt=(now-c.lastT)||16; c.vel=(x-c.lastX)/dt; c.lastX=x; c.lastT=now }
  const onUp=()=>{ const c=s.current; if(!c.down) return; c.down=false; ref.current.classList.remove('drag'); let v=c.vel*16; const step=()=>{ if(Math.abs(v)<0.4){ s.current.raf=0; return } ref.current.scrollLeft-=v; v*=0.94; s.current.raf=requestAnimationFrame(step) }; s.current.raf=requestAnimationFrame(step) }
  const itens=[...rotina].sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))
  return (
    <div ref={ref} className="track" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}>
      {itens.map(b=>{ const gold=/weg/i.test(b.titulo)
        return (
          <div key={b.id} className={`tblock ${gold?'tgold sheen-host':''}`}>
            {gold && <div className="sheen"/>}
            <div className="thead"><div className="tic"><Icon n={b.icone} s={19}/></div><div className="thora mono">{b.hora}</div></div>
            <div className="ttit" style={ b.feito?{color:'var(--dim2)',textDecoration:'line-through'}:{} }>{b.titulo}</div>
            <div className="tdur">{fmtDur(b.duracaoMin)}</div>
            <div className="tdone" onClick={(e)=>{ e.stopPropagation(); if(!s.current.moved) toggle(b.id) }}>
              <span className={`tcheck ${b.feito?'on':''}`}>{b.feito && <Icon n="check" s={11}/>}</span>{b.feito?'feito':'marcar feito'}
            </div>
          </div>
        )})}
    </div>
  )
}

function Inicio({ dados, setDados }){
  const [m,setM]=useState(false); useEffect(()=>{const id=setTimeout(()=>setM(true),150);return()=>clearTimeout(id)},[])
  const r=resumo(dados); const livre=useCountUp(Math.max(0,r.livre),1400,m)
  const toggleRot=(id)=>setDados(d=>({...d,rotina:d.rotina.map(i=>i.id===id?{...i,feito:!i.feito}:i)}))
  const pagar=(id)=>setDados(d=>({...d,contas:d.contas.map(c=>c.id===id?{...c,pago:!c.pago}:c)}))
  const hoje=new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'})
  return (
    <div>
      <div className="top">
        <div className="brand"><div className="logo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#E8C577" strokeWidth="1.3"/><path d="M4 14c3-2 5-2 8 0s5 2 8 0" stroke="#F6E6B0" strokeWidth="1.5" strokeLinecap="round"/></svg></div><div className="bname">F<b>o</b>co</div></div>
        <div className="date">{dados.perfil.nome}<br/><span className="mono">{hoje}</span></div>
      </div>
      <div className="card hero sheen-host">
        <div className="sheen"/>
        <div className="hlbl">LIVRE PRA GASTAR</div>
        <div className="hbig mono">{fmtR(Math.round(livre))}</div>
        <div className="hsub mono">de {fmtR(r.renda)}</div>
        <div className="bar"><div className="barf" style={{width:m?`${r.comprometidoPct}%`:'0%'}}/></div>
        <div className="ticks"><span>0</span><span>25%</span><span>50%</span><span>75%</span><span>comprometido {r.comprometidoPct}%</span></div>
      </div>
      <div className="sect">TRAJETÓRIA DE HOJE <span className="ln"/></div>
      <Trajetoria rotina={dados.rotina} toggle={toggleRot}/>
      <div className="sect">PRÓXIMA CONTA <span className="ln"/></div>
      {r.proxima ? (
        <div className="card conta">
          <div className="cic"><Icon n="bolt" s={20}/></div>
          <div><div className="cnome">{r.proxima.nome}</div><div className="cmeta">vence dia {r.proxima.dia}</div></div>
          <div className="cval"><div className="v mono">{fmtR(r.proxima.valor)}</div><div className="cpay" onClick={()=>pagar(r.proxima.id)}>marcar paga</div></div>
        </div>
      ) : (<div className="card conta"><div className="cnome" style={{fontSize:14,color:'var(--dim)'}}>Sem contas pendentes</div></div>)}
      <div className="glance">
        <div className="card gc"><div className="gcl">Custo de vida</div><div className="gcv mono">{fmtR(r.custoVida)}</div></div>
        <div className="card gc"><div className="gcl">Pago</div><div className="gcv dim mono">{fmtR(r.pago)}</div></div>
        <div className="card gc"><div className="gcl">Falta</div><div className="gcv red mono">{fmtR(r.falta)}</div></div>
      </div>
    </div>
  )
}

function Financas({ dados, setDados }){
  const [nova,setNova]=useState(false)
  const vazio={ nome:'', valor:'', dia:'', icone:'card' }
  const [f,setF]=useState(vazio); const set=(k,v)=>setF(s=>({...s,[k]:v}))
  const add=()=>{ if(!f.nome.trim())return; setDados(d=>({...d,contas:[...d.contas,{id:Date.now(),nome:f.nome,valor:Number(f.valor)||0,dia:f.dia===''?null:Number(f.dia),pago:false,icone:f.icone}]})); setF(vazio); setNova(false) }
  const pagar=(id)=>setDados(d=>({...d,contas:d.contas.map(c=>c.id===id?{...c,pago:!c.pago}:c)}))
  const del=(id)=>setDados(d=>({...d,contas:d.contas.filter(c=>c.id!==id)}))
  const editDia=(c)=>{ const v=window.prompt('Dia do vencimento (1-31, vazio p/ nenhum):', c.dia??''); if(v===null)return; const dia=v.trim()===''?null:Math.max(1,Math.min(31,Number(v)||1)); setDados(d=>({...d,contas:d.contas.map(x=>x.id===c.id?{...x,dia}:x)})) }
  const r=resumo(dados)
  const contas=[...dados.contas].sort((a,b)=>{const da=a.dia==null?99:a.dia,db=b.dia==null?99:b.dia;return da-db})
  const cor=(st)=>(st==='vencida'||st==='hoje')?'var(--red)':(st==='paga'?'var(--dim2)':'var(--gold)')
  const rot={paga:'PAGA',vencida:'VENCIDA',hoje:'VENCE HOJE',pendente:'',semdata:''}
  const evs=eventosOrdenados(dados)
  const corEv=(t)=>t==='entrada'?'var(--gold)':(t==='saida'?'var(--red)':'var(--bone)')
  const icoEv=(t)=>t==='entrada'?'up':(t==='saida'?'down':'star')
  return (
    <div>
      <div className="hdr"><div><h1>Finanças</h1><div className="sub">{new Date().toLocaleDateString('pt-BR',{month:'long'})}</div></div></div>
      <div className="glance" style={{marginTop:0}}>
        <div className="card gc"><div className="gcl">Custo de vida</div><div className="gcv mono">{fmtR(r.custoVida)}</div></div>
        <div className="card gc"><div className="gcl">Pago</div><div className="gcv dim mono">{fmtR(r.pago)}</div></div>
        <div className="card gc"><div className="gcl">Falta</div><div className="gcv red mono">{fmtR(r.falta)}</div></div>
      </div>
      <div className="sect">CONTAS DO MÊS <span className="ln"/></div>
      {contas.map(c=>{ const st=statusConta(c)
        return (
          <div className="item" key={c.id}>
            <div onClick={()=>pagar(c.id)} style={{cursor:'pointer'}} className={`ico ${(st==='vencida'||st==='hoje')?'red':''}`}>{c.pago?<Icon n="check" s={17}/>:<Icon n={c.icone} s={17}/>}</div>
            <div className="nm">
              <div className="t" style={c.pago?{color:'var(--dim2)',textDecoration:'line-through'}:{}}>{c.nome}</div>
              <div className="s" onClick={()=>editDia(c)} style={{cursor:'pointer'}}>{c.dia!=null?`vence dia ${c.dia}`:'definir vencimento'} · editar</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="mono" style={{fontSize:15,fontWeight:600,color:cor(st)}}>{fmtR(c.valor)}</div>
              {rot[st] && <div className="mono" style={{fontSize:8.5,letterSpacing:1,color:cor(st),marginTop:2}}>{rot[st]}</div>}
            </div>
            <button className="btn-ghost" onClick={()=>del(c.id)} style={{marginLeft:8}}><Icon n="trash" s={16}/></button>
          </div>
        )})}
      {nova?(
        <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--goldline)'}}>
          <div className="field"><label>Nome</label><input value={f.nome} onChange={e=>set('nome',e.target.value)}/></div>
          <div className="grid2">
            <div className="field"><label>Valor R$</label><input type="number" value={f.valor} onChange={e=>set('valor',e.target.value)}/></div>
            <div className="field"><label>Dia (opcional)</label><input type="number" min="1" max="31" value={f.dia} onChange={e=>set('dia',e.target.value)}/></div>
          </div>
          <button className="btn btn-gold" style={{width:'100%'}} onClick={add}><Icon n="plus" s={16}/> Salvar</button>
          <button className="btn-ghost" style={{width:'100%',marginTop:10}} onClick={()=>setNova(false)}>cancelar</button>
        </div>
      ):(<button className="btn btn-line" style={{width:'100%',marginTop:14}} onClick={()=>setNova(true)}><Icon n="plus" s={16}/> Nova conta</button>)}
      <div className="sect">RESERVAS DO MÊS <span className="ln"/></div>
      <div style={{fontSize:11,color:'var(--dim2)',marginBottom:8}}>metas · total {fmtR(r.reservasTotal)}</div>
      {dados.reservas.map(rv=>(
        <div className="item" key={rv.id}>
          <div className="ico"><Icon n={rv.icone} s={17}/></div>
          <div className="nm"><div className="t">{rv.nome}</div></div>
          <div className="mono" style={{fontSize:15,fontWeight:600,color:'var(--gold)'}}>{fmtR(rv.meta)}</div>
        </div>
      ))}
      <div className="sect">CALENDÁRIO DO ANO <span className="ln"/></div>
      {evs.map(e=>(
        <div className="item" key={e.id}>
          <div className="ico" style={{color:corEv(e.tipo)}}><Icon n={icoEv(e.tipo)} s={17}/></div>
          <div className="nm"><div className="t">{e.nome}</div><div className="s mono">{e.dt?e.dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'—'}</div></div>
          <div style={{textAlign:'right'}}>
            {e.valor?<div className="mono" style={{fontSize:14,fontWeight:600,color:corEv(e.tipo)}}>{fmtR(e.valor)}</div>:null}
            <div className="mono" style={{fontSize:11,color:'var(--dim2)',marginTop:2}}>{e.dias===0?'hoje':`faltam ${e.dias}d`}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Agenda({ dados, setDados }){
  const vazio={ titulo:'', hora:'08:00', duracaoMin:60, icone:'meal' }
  const [f,setF]=useState(vazio); const set=(k,v)=>setF(s=>({...s,[k]:v}))
  const add=()=>{ if(!f.titulo.trim())return; setDados(d=>({...d,rotina:[...d.rotina,{...f,id:Date.now(),duracaoMin:Number(f.duracaoMin)||0,feito:false}]})); setF(vazio) }
  const del=(id)=>setDados(d=>({...d,rotina:d.rotina.filter(i=>i.id!==id)}))
  const toggle=(id)=>setDados(d=>({...d,rotina:d.rotina.map(i=>i.id===id?{...i,feito:!i.feito}:i)}))
  const editHora=(i)=>{ const v=window.prompt('Horário (HH:MM):',i.hora); if(!v)return; setDados(d=>({...d,rotina:d.rotina.map(x=>x.id===i.id?{...x,hora:v}:x)})) }
  const itens=[...dados.rotina].sort((a,b)=>horaMin(a.hora)-horaMin(b.hora))
  return (
    <div>
      <div className="hdr"><div><h1>Agenda</h1><div className="sub">rotina</div></div></div>
      <div className="sect">NOVO COMPROMISSO <span className="ln"/></div>
      <div className="field"><label>Título</label><input value={f.titulo} onChange={e=>set('titulo',e.target.value)}/></div>
      <div className="grid2">
        <div className="field"><label>Hora</label><input type="time" value={f.hora} onChange={e=>set('hora',e.target.value)}/></div>
        <div className="field"><label>Duração (min)</label><input type="number" value={f.duracaoMin} onChange={e=>set('duracaoMin',e.target.value)}/></div>
      </div>
      <div className="field"><label>Tipo</label>
        <select value={f.icone} onChange={e=>set('icone',e.target.value)}>
          <option value="meal">Refeição</option><option value="dumbbell">Treino</option><option value="book">Estudo</option>
          <option value="wrench">Trabalho</option><option value="pill">Saúde</option><option value="moon">Sono</option><option value="sun">Acordar</option>
        </select></div>
      <button className="btn btn-gold" style={{width:'100%',marginTop:6}} onClick={add}><Icon n="plus" s={16}/> Adicionar</button>
      <div className="sect">O DIA <span className="ln"/></div>
      {itens.map(i=>(
        <div className="item" key={i.id}>
          <div onClick={()=>toggle(i.id)} style={{cursor:'pointer'}} className="ico">{i.feito?<Icon n="check" s={17}/>:<Icon n={i.icone} s={17}/>}</div>
          <div className="nm">
            <div className="t" style={i.feito?{color:'var(--dim2)',textDecoration:'line-through'}:{}}>{i.titulo}</div>
            <div className="s" onClick={()=>editHora(i)} style={{cursor:'pointer'}}><span className="mono" style={{color:'var(--gold)'}}>{i.hora}</span> · {fmtDur(i.duracaoMin)} · editar</div>
          </div>
          <button className="btn-ghost" onClick={()=>del(i.id)}><Icon n="trash" s={17}/></button>
        </div>
      ))}
    </div>
  )
}

/* Copiloto — chat por comandos (offline) */
function Copiloto({ dados, setDados }){
  const [msgs,setMsgs]=useState([{from:'bot',text:'Fala comigo. Ex: "quanto posso gastar", "próxima conta", "próximo", "resumo", "paguei energia", "fiz academia".'}])
  const [txt,setTxt]=useState('')
  const endRef=useRef(null)
  useEffect(()=>{ endRef.current && endRef.current.scrollIntoView({behavior:'smooth'}) },[msgs])

  const responder=(qRaw)=>{
    const q=qRaw.toLowerCase().trim(); const r=resumo(dados)
    const mPag=q.match(/pag(?:uei|ar|o)\s+(.+)/)
    if(mPag){ const alvo=mPag[1].trim(); const c=dados.contas.find(x=>x.nome.toLowerCase().includes(alvo)); if(c){ setDados(d=>({...d,contas:d.contas.map(x=>x.id===c.id?{...x,pago:true}:x)})); return `Marquei ${c.nome} como paga.` } return `Não achei a conta "${alvo}".` }
    const mFez=q.match(/(?:fiz|feito|terminei|conclu[ií])\s+(.+)/)
    if(mFez){ const alvo=mFez[1].trim(); const it=dados.rotina.find(x=>x.titulo.toLowerCase().includes(alvo)); if(it){ setDados(d=>({...d,rotina:d.rotina.map(x=>x.id===it.id?{...x,feito:true}:x)})); return `Feito: ${it.titulo}.` } return `Não achei "${alvo}" na agenda.` }
    if(/posso gastar|quanto.*(livre|gastar)|^livre/.test(q)) return `Livre pra gastar: ${fmtR(Math.max(0,r.livre))} — de ${fmtR(r.renda)}, ${r.comprometidoPct}% comprometido.`
    if(/pr[oó]xima conta|conta.*(vence|vencer|pr[oó]xima)/.test(q)) return r.proxima?`Próxima conta: ${r.proxima.nome}, dia ${r.proxima.dia}, ${fmtR(r.proxima.valor)}.`:`Nenhuma conta com vencimento definido.`
    if(/pr[oó]ximo|agora|movimento/.test(q)){ const p=proximo(dados.rotina); return p?`Agora: ${p.titulo} às ${p.hora}.`:`Nada pendente na agenda.` }
    if(/falta.*pagar|quanto.*falta/.test(q)) return `Falta pagar este mês: ${fmtR(r.falta)}.`
    if(/resumo|situa[cç]/.test(q)) return `Custo de vida ${fmtR(r.custoVida)} · pago ${fmtR(r.pago)} · falta ${fmtR(r.falta)} · livre ${fmtR(Math.max(0,r.livre))}.`
    return `Ainda não entendo isso. Tento: "quanto posso gastar" · "próxima conta" · "próximo" · "resumo" · "paguei <conta>" · "fiz <tarefa>".`
  }
  const enviar=()=>{ const q=txt.trim(); if(!q) return; const resp=responder(q); setMsgs(m=>[...m,{from:'user',text:q},{from:'bot',text:resp}]); setTxt('') }

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'78vh'}}>
      <div className="hdr"><div><h1>Copiloto</h1><div className="sub">fale comigo</div></div></div>
      <div className="chat" style={{flex:1}}>
        {msgs.map((m,i)=>(<div key={i} className={`msg ${m.from}`}>{m.text}</div>))}
        <div ref={endRef}/>
      </div>
      <div className="chatbar">
        <input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')enviar()}} placeholder="escreva um comando..."/>
        <button onClick={enviar}><Icon n="send" s={18}/></button>
      </div>
    </div>
  )
}

function Perfil({ dados, setDados }){
  const r=resumo(dados)
  const fileRef=useRef(null)
  const reset=()=>{ if(window.confirm('Apagar tudo e voltar ao inicial?')) setDados(resetar()) }
  const exportar=()=>{ const blob=new Blob([JSON.stringify(dados,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='foco-backup.json'; a.click(); URL.revokeObjectURL(url) }
  const importar=(e)=>{ const file=e.target.files&&e.target.files[0]; if(!file)return; const rd=new FileReader(); rd.onload=()=>{ try{ const d=JSON.parse(rd.result); if(d&&d.contas&&d.rotina){ setDados(d) } else alert('Arquivo não parece um backup do Foco.') }catch(x){ alert('Arquivo inválido.') } }; rd.readAsText(file); e.target.value='' }
  return (
    <div>
      <div className="hdr"><div><h1>Perfil</h1><div className="sub">ajustes</div></div></div>
      <div className="field"><label>Nome</label><input value={dados.perfil.nome} onChange={e=>setDados(d=>({...d,perfil:{...d.perfil,nome:e.target.value}}))}/></div>
      <div className="field"><label>Renda do mês (R$)</label><input type="number" value={dados.perfil.renda} onChange={e=>setDados(d=>({...d,perfil:{...d.perfil,renda:Number(e.target.value)||0}}))}/></div>

      <div className="sect">RESUMO <span className="ln"/></div>
      <div className="prow"><span className="k">Custo de vida</span><span className="v mono">{fmtR(r.custoVida)}</span></div>
      <div className="prow"><span className="k">Livre pra gastar</span><span className="v mono" style={{color:'var(--gold)'}}>{fmtR(Math.max(0,r.livre))}</span></div>
      <div className="prow"><span className="k">Comprometido</span><span className="v mono">{r.comprometidoPct}%</span></div>
      <div className="prow"><span className="k">Próximo reajuste WEG</span><span className="v mono">Nov/2026 · +5%</span></div>

      <div className="sect">BACKUP <span className="ln"/></div>
      <button className="btn btn-line" style={{width:'100%'}} onClick={exportar}>Exportar dados (JSON)</button>
      <button className="btn btn-line" style={{width:'100%',marginTop:10}} onClick={()=>fileRef.current&&fileRef.current.click()}>Importar dados</button>
      <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={importar}/>

      <div className="sect">DADOS <span className="ln"/></div>
      <button className="btn btn-red" style={{width:'100%'}} onClick={reset}>Resetar dados</button>
      <div className="mono" style={{fontSize:11,color:'var(--dim2)',marginTop:20,textAlign:'center'}}>FOCO · v2.2</div>
    </div>
  )
}

function BottomNav(){
  const itens=[['/','wallet','Início'],['/financas','card','Finanças'],['/agenda','cal','Agenda'],['/copiloto','spark','Copiloto'],['/perfil','user','Perfil']]
  return (<nav className="nav">{itens.map(([to,ic,lb])=>(<NavLink key={to} to={to} end={to==='/'} className={({isActive})=>'navitem'+(isActive?' on':'')}><Icon n={ic} s={21}/> {lb}</NavLink>))}</nav>)
}

export default function App(){
  const [dados,setDados]=useDados()
  return (
    <HashRouter>
      <div className="shell">
        <div className="content">
          <Routes>
            <Route path="/" element={<Inicio dados={dados} setDados={setDados}/>}/>
            <Route path="/financas" element={<Financas dados={dados} setDados={setDados}/>}/>
            <Route path="/agenda" element={<Agenda dados={dados} setDados={setDados}/>}/>
            <Route path="/copiloto" element={<Copiloto dados={dados} setDados={setDados}/>}/>
            <Route path="/perfil" element={<Perfil dados={dados} setDados={setDados}/>}/>
          </Routes>
        </div>
        <BottomNav/>
      </div>
    </HashRouter>
  )
}
