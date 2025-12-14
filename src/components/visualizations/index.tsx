import { VisualizationProps, COLORS, PHASES } from "../../types";

// ============ BOX VISUALIZATION ============
export function BoxVisualization({ phase, progress }: VisualizationProps) {
  const getMarkerPosition = () => {
    const size = 200, offset = 20, p = progress;
    switch (phase) {
      case 0: return { x: offset + p * size, y: offset };
      case 1: return { x: offset + size, y: offset + p * size };
      case 2: return { x: offset + size - p * size, y: offset + size };
      case 3: return { x: offset, y: offset + size - p * size };
      default: return { x: offset, y: offset };
    }
  };
  const marker = getMarkerPosition();

  return (
    <svg viewBox="0 0 240 240" className="viz-svg">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="markerGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor={COLORS[phase]}/></linearGradient>
      </defs>
      <rect x="20" y="20" width="200" height="200" rx="8" fill="none" stroke="var(--border-light)" strokeWidth="2"/>
      {[{x1:20,y1:20,x2:220,y2:20,i:0},{x1:220,y1:20,x2:220,y2:220,i:1},{x1:220,y1:220,x2:20,y2:220,i:2},{x1:20,y1:220,x2:20,y2:20,i:3}].map(({x1,y1,x2,y2,i})=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS[i]} strokeWidth={phase===i?6:2} strokeLinecap="round" opacity={phase===i?1:0.3} style={{transition:'stroke-width 0.3s ease, opacity 0.3s ease'}}/>
      ))}
      <circle cx={marker.x} cy={marker.y} r="12" fill={COLORS[phase]} style={{filter:'url(#glow)', willChange:'cx,cy'}}/>
      <circle cx={marker.x} cy={marker.y} r="6" fill="var(--text-primary)" style={{willChange:'cx,cy'}}/>
      <text x="120" y="14" textAnchor="middle" fill={phase===0?COLORS[0]:'var(--text-dim)'} fontSize="11" fontWeight="500" style={{transition:'fill 0.3s ease'}}>IN</text>
      <text x="230" y="124" textAnchor="middle" fill={phase===1?COLORS[1]:'var(--text-dim)'} fontSize="11" fontWeight="500" style={{transition:'fill 0.3s ease'}}>HOLD</text>
      <text x="120" y="236" textAnchor="middle" fill={phase===2?COLORS[2]:'var(--text-dim)'} fontSize="11" fontWeight="500" style={{transition:'fill 0.3s ease'}}>OUT</text>
      <text x="10" y="124" textAnchor="middle" fill={phase===3?COLORS[3]:'var(--text-dim)'} fontSize="11" fontWeight="500" style={{transition:'fill 0.3s ease'}}>HOLD</text>
    </svg>
  );
}

// ============ ORBIT VISUALIZATION ============
export function OrbitVisualization({ phase, progress, durations }: VisualizationProps) {
  const total = durations.reduce((a,b) => a+b, 0);
  let cumulative = 0;
  for (let i = 0; i < phase; i++) cumulative += durations[i];
  cumulative += progress * durations[phase];
  const angle = (cumulative / total) * 360 - 90;
  const rad = angle * Math.PI / 180;
  const cx = 120, cy = 120, r = 90;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  const arcAngles: { start: number; sweep: number; i: number }[] = [];
  let start = -90;
  durations.forEach((d, i) => {
    const sweep = (d / total) * 360;
    arcAngles.push({ start, sweep, i });
    start += sweep;
  });

  const describeArc = (startAngle: number, sweepAngle: number) => {
    const s = startAngle * Math.PI / 180;
    const e = (startAngle + sweepAngle) * Math.PI / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = sweepAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg viewBox="0 0 240 240" className="viz-svg">
      <defs><filter id="glow2"><feGaussianBlur stdDeviation="4"/></filter></defs>
      {arcAngles.map(({start, sweep, i}) => (
        <path key={i} d={describeArc(start, sweep)} fill="none" stroke={COLORS[i]} strokeWidth={phase===i?8:4} opacity={phase===i?1:0.3} strokeLinecap="round" style={{transition:'stroke-width 0.3s ease, opacity 0.3s ease'}}/>
      ))}
      <circle cx={x} cy={y} r="14" fill={COLORS[phase]} style={{filter:'url(#glow2)', willChange:'cx,cy,fill'}}/>
      <circle cx={x} cy={y} r="8" fill="var(--text-primary)" style={{willChange:'cx,cy'}}/>
      <text x="120" y="125" textAnchor="middle" fill={COLORS[phase]} fontSize="16" fontWeight="500" style={{transition:'fill 0.3s ease'}}>{PHASES[phase].short}</text>
    </svg>
  );
}

// ============ BLOB VISUALIZATION ============
export function BlobVisualization({ phase, progress }: VisualizationProps) {
  let scale = 0.5;
  if (phase === 0) scale = 0.5 + progress * 0.5;
  else if (phase === 1) scale = 1;
  else if (phase === 2) scale = 1 - progress * 0.5;
  else scale = 0.5;
  const isHolding = phase === 1 || phase === 3;

  return (
    <div className="viz-container">
      <div style={{position:'relative',width:'80%',aspectRatio:'1'}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid var(--border-light)'}}/>
        <div style={{
          position:'absolute',top:'50%',left:'50%',width:'100%',height:'100%',
          transform:`translate(-50%,-50%) scale(${scale})`,
          borderRadius:'50%',
          background:`radial-gradient(circle at 30% 30%, ${COLORS[phase]}88, ${COLORS[phase]}44)`,
          boxShadow:`0 0 60px ${COLORS[phase]}66, inset 0 0 40px ${COLORS[phase]}44`,
          willChange: 'transform',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
        }}/>
        {isHolding && <div style={{
          position:'absolute',top:'50%',left:'50%',width:'100%',height:'100%',
          transform:`translate(-50%,-50%) scale(${scale})`,
          borderRadius:'50%',border:`2px solid ${COLORS[phase]}`,
          animation:'pulse 2s ease-in-out infinite',
        }}/>}
      </div>
    </div>
  );
}

// ============ BAR VISUALIZATION ============
export function BarVisualization({ phase, progress, durations }: VisualizationProps) {
  const total = durations.reduce((a,b) => a+b, 0);
  const widths = durations.map(d => (d/total)*100);

  return (
    <div className="viz-container" style={{flexDirection:'column',gap:12}}>
      <div style={{display:'flex',width:'100%',height:48,borderRadius:12,overflow:'hidden',background:'var(--bg-input)'}}>
        {widths.map((w, i) => (
          <div key={i} style={{width:`${w}%`,position:'relative',borderRight: i<3?'1px solid rgba(0,0,0,0.3)':'none'}}>
            <div style={{
              position:'absolute',inset:0,
              background: i < phase ? COLORS[i] : i === phase ? COLORS[i] : 'transparent',
              opacity: i < phase ? 0.6 : i === phase ? 0.9 : 0,
              width: i === phase ? `${progress*100}%` : '100%',
              willChange: i === phase ? 'width' : 'auto',
              transition: 'opacity 0.3s ease',
            }}/>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,color: i <= phase ? 'var(--text-primary)' : 'var(--text-dim)',transition:'color 0.3s ease'}}>{PHASES[i].short}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:24,fontWeight:300,color:COLORS[phase],transition:'color 0.3s ease'}}>{PHASES[phase].label}</div>
    </div>
  );
}

// ============ LADDER VISUALIZATION ============
export function LadderVisualization({ phase, progress, durations }: VisualizationProps) {
  return (
    <div className="viz-container" style={{flexDirection:'column',gap:8,width:'100%',maxWidth:280}}>
      {PHASES.map((p, i) => (
        <div key={i} style={{
          display:'flex',alignItems:'center',gap:12,
          padding:'12px 16px',borderRadius:12,
          background: phase === i ? `${COLORS[i]}22` : 'var(--bg-card)',
          border: phase === i ? `2px solid ${COLORS[i]}` : '2px solid transparent',
          transition:'background 0.3s ease, border-color 0.3s ease',
        }}>
          <div style={{flex:1,fontWeight:phase===i?600:400,color:phase===i?COLORS[i]:'var(--text-muted)',transition:'color 0.3s ease, font-weight 0.3s ease'}}>{p.label}</div>
          <div style={{width:80,height:6,background:'var(--border-light)',borderRadius:3,overflow:'hidden'}}>
            <div style={{
              height:'100%',background:COLORS[i],borderRadius:3,
              width: i < phase ? '100%' : i === phase ? `${progress*100}%` : '0%',
              willChange: i === phase ? 'width' : 'auto',
            }}/>
          </div>
          <div style={{width:24,fontSize:12,color:'var(--text-dim)',textAlign:'right'}}>{durations[i]}s</div>
        </div>
      ))}
    </div>
  );
}

// ============ TRAPEZOID VISUALIZATION ============
export function TrapezoidVisualization({ phase, progress }: VisualizationProps) {
  const segments = [
    {x1:40,y1:180,x2:80,y2:60,i:0},
    {x1:80,y1:60,x2:160,y2:60,i:1},
    {x1:160,y1:60,x2:200,y2:180,i:2},
    {x1:200,y1:180,x2:40,y2:180,i:3},
  ];

  const getMarkerPos = () => {
    const seg = segments[phase];
    return {
      x: seg.x1 + (seg.x2 - seg.x1) * progress,
      y: seg.y1 + (seg.y2 - seg.y1) * progress,
    };
  };
  const marker = getMarkerPos();

  return (
    <svg viewBox="0 0 240 240" className="viz-svg">
      <defs><filter id="glow3"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <polygon points="40,180 80,60 160,60 200,180" fill="none" stroke="var(--border-light)" strokeWidth="2"/>
      {segments.map(({x1,y1,x2,y2,i}) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS[i]} strokeWidth={phase===i?6:2} opacity={phase===i?1:0.3} strokeLinecap="round" style={{transition:'stroke-width 0.3s ease, opacity 0.3s ease'}}/>
      ))}
      <circle cx={marker.x} cy={marker.y} r="12" fill={COLORS[phase]} style={{filter:'url(#glow3)', willChange:'cx,cy'}}/>
      <circle cx={marker.x} cy={marker.y} r="6" fill="var(--text-primary)" style={{willChange:'cx,cy'}}/>
      <text x="45" y="130" fill={phase===0?COLORS[0]:'var(--text-dim)'} fontSize="10" style={{transition:'fill 0.3s ease'}}>IN</text>
      <text x="110" y="50" fill={phase===1?COLORS[1]:'var(--text-dim)'} fontSize="10" style={{transition:'fill 0.3s ease'}}>HOLD</text>
      <text x="185" y="130" fill={phase===2?COLORS[2]:'var(--text-dim)'} fontSize="10" style={{transition:'fill 0.3s ease'}}>OUT</text>
      <text x="110" y="198" fill={phase===3?COLORS[3]:'var(--text-dim)'} fontSize="10" style={{transition:'fill 0.3s ease'}}>HOLD</text>
    </svg>
  );
}

// ============ FLOWER VISUALIZATION ============
export function FlowerVisualization({ phase, progress }: VisualizationProps) {
  return (
    <svg viewBox="0 0 240 240" className="viz-svg">
      <defs>
        <filter id="glow4"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      {[
        {cx:120,cy:70,rx:25,ry:45,i:0},
        {cx:170,cy:120,rx:45,ry:25,i:1},
        {cx:120,cy:170,rx:25,ry:45,i:2},
        {cx:70,cy:120,rx:45,ry:25,i:3},
      ].map(({cx,cy,rx,ry,i}) => {
        const isActive = phase === i;
        const scale = isActive ? 1 + progress * 0.15 : 1;
        return (
          <ellipse
            key={i}
            cx={cx} cy={cy} rx={rx * scale} ry={ry * scale}
            fill={COLORS[i]}
            opacity={isActive?0.9:0.3}
            style={{filter:isActive?'url(#glow4)':undefined, transition:'opacity 0.3s ease', willChange:'rx,ry'}}
          />
        );
      })}
      <circle cx="120" cy="120" r="20" fill="#1a1a2e" stroke={COLORS[phase]} strokeWidth="3" style={{transition:'stroke 0.3s ease'}}/>
      <text x="120" y="125" textAnchor="middle" fill={COLORS[phase]} fontSize="10" fontWeight="600" style={{transition:'fill 0.3s ease'}}>{PHASES[phase].short}</text>
    </svg>
  );
}

// ============ MINIMAL VISUALIZATION ============
export function MinimalVisualization({ phase, progress }: VisualizationProps) {
  let scale = 1;
  if (phase === 0) scale = 1 + progress * 0.3;
  else if (phase === 1) scale = 1.3;
  else if (phase === 2) scale = 1.3 - progress * 0.3;
  else scale = 1;

  return (
    <div className="viz-container" style={{flexDirection:'column'}}>
      <div style={{
        position:'relative',
        display:'flex',alignItems:'center',justifyContent:'center',
        width:200,height:200,
      }}>
        <div style={{
          position:'absolute',
          width:150,height:150,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${COLORS[phase]}33, transparent)`,
          transform:`scale(${scale})`,
          willChange: 'transform',
          transition: 'background 0.3s ease',
        }}/>
        <div style={{
          fontFamily:'"Fraunces", serif',
          fontSize:36,
          fontWeight:300,
          color:COLORS[phase],
          zIndex:1,
          transition: 'color 0.3s ease',
        }}>
          {PHASES[phase].label}
        </div>
      </div>
    </div>
  );
}

// ============ RING VISUALIZATION ============
export function RingVisualization({ phase, progress, durations }: VisualizationProps) {
  const total = durations.reduce((a,b) => a+b, 0);
  const cx = 120, cy = 120, r = 85;

  let cumulative = 0;
  for (let i = 0; i < phase; i++) cumulative += durations[i];
  cumulative += progress * durations[phase];
  const fillAngle = (cumulative / total) * 360;

  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const s = (startAngle - 90) * Math.PI / 180;
    const e = (endAngle - 90) * Math.PI / 180;
    const x1 = cx + radius * Math.cos(s), y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e), y2 = cy + radius * Math.sin(e);
    const large = (endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  let arcStart = 0;
  const arcs = durations.map((d, i) => {
    const sweep = (d / total) * 360;
    const arc = { start: arcStart, end: arcStart + sweep, i };
    arcStart += sweep;
    return arc;
  });

  return (
    <svg viewBox="0 0 240 240" className="viz-svg">
      <defs><filter id="glow5"><feGaussianBlur stdDeviation="3"/></filter></defs>
      {arcs.map(({start, end, i}) => (
        <path key={i} d={describeArc(start, end, r)} fill="none" stroke={COLORS[i]} strokeWidth="16" opacity="0.2" strokeLinecap="butt"/>
      ))}
      {fillAngle > 0.5 && (
        <path d={describeArc(0, fillAngle, r)} fill="none" stroke={COLORS[phase]} strokeWidth="16" strokeLinecap="round" style={{filter:'url(#glow5)', willChange:'d', transition:'stroke 0.3s ease'}}/>
      )}
      <text x="120" y="110" textAnchor="middle" fill={COLORS[phase]} fontSize="14" fontWeight="500" style={{transition:'fill 0.3s ease'}}>{PHASES[phase].label}</text>
      <text x="120" y="140" textAnchor="middle" fill="var(--text-muted)" fontSize="28" fontWeight="300">{Math.ceil(durations[phase] * (1 - progress))}s</text>
    </svg>
  );
}

// ============ PATH VISUALIZATION ============
export function PathVisualization({ phase, progress, durations }: VisualizationProps) {
  const total = durations.reduce((a,b) => a+b, 0);
  const segmentWidths = durations.map(d => (d/total) * 200);

  let cumX = 20;
  const segments = segmentWidths.map((w, i) => {
    const seg = { x1: cumX, x2: cumX + w, i };
    cumX += w;
    return seg;
  });

  const markerX = segments[phase].x1 + (segments[phase].x2 - segments[phase].x1) * progress;

  return (
    <svg viewBox="0 0 240 120" className="viz-svg" style={{maxHeight:160}}>
      <defs><filter id="glow6"><feGaussianBlur stdDeviation="3"/></filter></defs>
      {segments.map(({x1, x2, i}) => (
        <line key={i} x1={x1} y1="60" x2={x2} y2="60" stroke={COLORS[i]} strokeWidth={phase===i?8:4} opacity={phase===i?1:0.4} strokeLinecap="round" style={{transition:'stroke-width 0.3s ease, opacity 0.3s ease'}}/>
      ))}
      {segments.map(({x1, x2, i}) => (
        <text key={i} x={(x1+x2)/2} y="90" textAnchor="middle" fill={phase===i?COLORS[i]:'var(--text-dim)'} fontSize="10" style={{transition:'fill 0.3s ease'}}>{PHASES[i].short}</text>
      ))}
      <circle cx={markerX} cy="60" r="12" fill={COLORS[phase]} style={{filter:'url(#glow6)', willChange:'cx'}}/>
      <circle cx={markerX} cy="60" r="6" fill="var(--text-primary)" style={{willChange:'cx'}}/>
    </svg>
  );
}

// ============ VISUALIZATION RENDERER ============
export function renderVisualization(vizId: string, props: VisualizationProps) {
  switch (vizId) {
    case 'box': return <BoxVisualization {...props} />;
    case 'orbit': return <OrbitVisualization {...props} />;
    case 'blob': return <BlobVisualization {...props} />;
    case 'bar': return <BarVisualization {...props} />;
    case 'ladder': return <LadderVisualization {...props} />;
    case 'trapezoid': return <TrapezoidVisualization {...props} />;
    case 'flower': return <FlowerVisualization {...props} />;
    case 'minimal': return <MinimalVisualization {...props} />;
    case 'ring': return <RingVisualization {...props} />;
    case 'path': return <PathVisualization {...props} />;
    default: return <BoxVisualization {...props} />;
  }
}
