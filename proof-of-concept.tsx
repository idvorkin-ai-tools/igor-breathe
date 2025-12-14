import React, { useState, useEffect, useRef, useCallback } from 'react';

const PHASES = [
  { id: 'in', label: 'Breathe In', short: 'In', instruction: 'Inhale slowly...', voice: 'Breathe in' },
  { id: 'hold1', label: 'Hold', short: 'Hold', instruction: 'Hold gently...', voice: 'Hold' },
  { id: 'out', label: 'Breathe Out', short: 'Out', instruction: 'Exhale slowly...', voice: 'Breathe out' },
  { id: 'hold2', label: 'Hold', short: 'Hold', instruction: 'Rest...', voice: 'Hold' },
];

const DEFAULT_PATTERNS = [
  { id: 'box4', name: 'Box 4s', type: 'box', durations: [4, 4, 4, 4], boxDuration: 4 },
  { id: 'box8', name: 'Box 8s', type: 'box', durations: [8, 8, 8, 8], boxDuration: 8 },
  { id: 'relaxing', name: '4-7-8 Relaxing', type: 'trapezoid', durations: [4, 7, 8, 0] },
  { id: 'calm', name: 'Calm Wave', type: 'trapezoid', durations: [6, 2, 8, 2] },
];

const BOX_DURATIONS = [4, 5, 6, 8, 10, 12, 15];

const VISUALIZATIONS = [
  { id: 'box', name: 'Box Perimeter', icon: '◻', desc: 'Classic square with traveling marker' },
  { id: 'orbit', name: 'Orbiting Dot', icon: '◎', desc: 'Dot circles around a ring' },
  { id: 'blob', name: 'Breathing Blob', icon: '●', desc: 'Shape expands and contracts' },
  { id: 'bar', name: 'Progress Bar', icon: '▬', desc: 'Horizontal segmented bar' },
  { id: 'ladder', name: 'Breath Ladder', icon: '☰', desc: 'Vertical stacked phases' },
  { id: 'trapezoid', name: 'Hill / Ramp', icon: '△', desc: 'Climb up, across, down' },
  { id: 'flower', name: 'Four Petals', icon: '✿', desc: 'Petals pulse when active' },
  { id: 'minimal', name: 'Minimal Word', icon: 'Aa', desc: 'Just text with a pulse' },
  { id: 'ring', name: 'Timeline Ring', icon: '◐', desc: 'Circular progress sweep' },
  { id: 'path', name: 'Breath Path', icon: '∿', desc: 'Dot travels along a line' },
];

const COLORS = ['#7dd3c0', '#a8d4e6', '#c4b7d4', '#e8c4b8'];

// ============ VISUALIZATION COMPONENTS ============

const BoxVisualization = ({ phase, progress }) => {
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
      <rect x="20" y="20" width="200" height="200" rx="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
      {[{x1:20,y1:20,x2:220,y2:20,i:0},{x1:220,y1:20,x2:220,y2:220,i:1},{x1:220,y1:220,x2:20,y2:220,i:2},{x1:20,y1:220,x2:20,y2:20,i:3}].map(({x1,y1,x2,y2,i})=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS[i]} strokeWidth={phase===i?6:2} strokeLinecap="round" opacity={phase===i?1:0.3} filter={phase===i?'url(#glow)':undefined} style={{transition:'all 0.3s'}}/>
      ))}
      <circle cx={marker.x} cy={marker.y} r="12" fill="url(#markerGrad)" filter="url(#glow)"/>
      <circle cx={marker.x} cy={marker.y} r="6" fill="#fff"/>
      <text x="120" y="14" textAnchor="middle" fill={phase===0?COLORS[0]:'rgba(255,255,255,0.3)'} fontSize="11" fontWeight="500">IN</text>
      <text x="230" y="124" textAnchor="middle" fill={phase===1?COLORS[1]:'rgba(255,255,255,0.3)'} fontSize="11" fontWeight="500">HOLD</text>
      <text x="120" y="236" textAnchor="middle" fill={phase===2?COLORS[2]:'rgba(255,255,255,0.3)'} fontSize="11" fontWeight="500">OUT</text>
      <text x="10" y="124" textAnchor="middle" fill={phase===3?COLORS[3]:'rgba(255,255,255,0.3)'} fontSize="11" fontWeight="500">HOLD</text>
    </svg>
  );
};

const OrbitVisualization = ({ phase, progress, durations }) => {
  const total = durations.reduce((a,b) => a+b, 0);
  let cumulative = 0;
  for (let i = 0; i < phase; i++) cumulative += durations[i];
  cumulative += progress * durations[phase];
  const angle = (cumulative / total) * 360 - 90;
  const rad = angle * Math.PI / 180;
  const cx = 120, cy = 120, r = 90;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  const arcAngles = [];
  let start = -90;
  durations.forEach((d, i) => {
    const sweep = (d / total) * 360;
    arcAngles.push({ start, sweep, i });
    start += sweep;
  });

  const describeArc = (startAngle, sweepAngle) => {
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
        <path key={i} d={describeArc(start, sweep)} fill="none" stroke={COLORS[i]} strokeWidth={phase===i?8:4} opacity={phase===i?1:0.3} strokeLinecap="round" style={{transition:'all 0.3s'}}/>
      ))}
      <circle cx={x} cy={y} r="14" fill={COLORS[phase]} filter="url(#glow2)" style={{transition:'all 0.05s linear'}}/>
      <circle cx={x} cy={y} r="8" fill="#fff"/>
      <text x="120" y="125" textAnchor="middle" fill={COLORS[phase]} fontSize="16" fontWeight="500">{PHASES[phase].short}</text>
    </svg>
  );
};

const BlobVisualization = ({ phase, progress }) => {
  let scale = 0.5;
  if (phase === 0) scale = 0.5 + progress * 0.5;
  else if (phase === 1) scale = 1;
  else if (phase === 2) scale = 1 - progress * 0.5;
  else scale = 0.5;
  const isHolding = phase === 1 || phase === 3;

  return (
    <div className="viz-container">
      <div style={{position:'relative',width:'80%',aspectRatio:'1'}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.1)'}}/>
        <div style={{
          position:'absolute',top:'50%',left:'50%',width:'100%',height:'100%',
          transform:`translate(-50%,-50%) scale(${scale})`,
          borderRadius:'50%',
          background:`radial-gradient(circle at 30% 30%, ${COLORS[phase]}88, ${COLORS[phase]}44)`,
          boxShadow:`0 0 60px ${COLORS[phase]}66, inset 0 0 40px ${COLORS[phase]}44`,
          transition: isHolding ? 'transform 0.1s ease' : 'transform 0.05s linear',
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
};

const BarVisualization = ({ phase, progress, durations }) => {
  const total = durations.reduce((a,b) => a+b, 0);
  const widths = durations.map(d => (d/total)*100);

  return (
    <div className="viz-container" style={{flexDirection:'column',gap:12}}>
      <div style={{display:'flex',width:'100%',height:48,borderRadius:8,overflow:'hidden',background:'rgba(255,255,255,0.05)'}}>
        {widths.map((w, i) => (
          <div key={i} style={{width:`${w}%`,position:'relative',borderRight: i<3?'1px solid rgba(0,0,0,0.3)':'none'}}>
            <div style={{
              position:'absolute',inset:0,
              background: i < phase ? COLORS[i] : i === phase ? COLORS[i] : 'transparent',
              opacity: i < phase ? 0.6 : i === phase ? 0.9 : 0,
              width: i === phase ? `${progress*100}%` : '100%',
              transition: i === phase ? 'width 0.05s linear' : 'all 0.3s',
            }}/>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,color: i <= phase ? '#fff' : 'rgba(255,255,255,0.3)'}}>{PHASES[i].short}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:24,fontWeight:300,color:COLORS[phase]}}>{PHASES[phase].label}</div>
    </div>
  );
};

const LadderVisualization = ({ phase, progress, durations }) => {
  return (
    <div className="viz-container" style={{flexDirection:'column',gap:8,width:'100%',maxWidth:280}}>
      {PHASES.map((p, i) => (
        <div key={i} style={{
          display:'flex',alignItems:'center',gap:12,
          padding:'12px 16px',borderRadius:8,
          background: phase === i ? `${COLORS[i]}22` : 'rgba(255,255,255,0.03)',
          border: phase === i ? `2px solid ${COLORS[i]}` : '2px solid transparent',
          transition:'all 0.3s',
        }}>
          <div style={{flex:1,fontWeight:phase===i?600:400,color:phase===i?COLORS[i]:'rgba(255,255,255,0.5)'}}>{p.label}</div>
          <div style={{width:80,height:6,background:'rgba(255,255,255,0.1)',borderRadius:3,overflow:'hidden'}}>
            <div style={{
              height:'100%',background:COLORS[i],
              width: i < phase ? '100%' : i === phase ? `${progress*100}%` : '0%',
              transition: i === phase ? 'width 0.05s linear' : 'width 0.3s',
            }}/>
          </div>
          <div style={{width:24,fontSize:12,color:'rgba(255,255,255,0.4)',textAlign:'right'}}>{durations[i]}s</div>
        </div>
      ))}
    </div>
  );
};

const TrapezoidVisualization = ({ phase, progress }) => {
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
      <polygon points="40,180 80,60 160,60 200,180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
      {segments.map(({x1,y1,x2,y2,i}) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS[i]} strokeWidth={phase===i?6:2} opacity={phase===i?1:0.3} strokeLinecap="round" style={{transition:'all 0.3s'}}/>
      ))}
      <circle cx={marker.x} cy={marker.y} r="12" fill={COLORS[phase]} filter="url(#glow3)"/>
      <circle cx={marker.x} cy={marker.y} r="6" fill="#fff"/>
      <text x="45" y="130" fill={phase===0?COLORS[0]:'rgba(255,255,255,0.3)'} fontSize="10">IN</text>
      <text x="110" y="50" fill={phase===1?COLORS[1]:'rgba(255,255,255,0.3)'} fontSize="10">HOLD</text>
      <text x="185" y="130" fill={phase===2?COLORS[2]:'rgba(255,255,255,0.3)'} fontSize="10">OUT</text>
      <text x="110" y="198" fill={phase===3?COLORS[3]:'rgba(255,255,255,0.3)'} fontSize="10">HOLD</text>
    </svg>
  );
};

const FlowerVisualization = ({ phase, progress }) => {
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
            filter={isActive?'url(#glow4)':undefined}
            style={{transition:'all 0.1s',transformOrigin:`${cx}px ${cy}px`}}
          />
        );
      })}
      <circle cx="120" cy="120" r="20" fill="#1a1a2e" stroke={COLORS[phase]} strokeWidth="3"/>
      <text x="120" y="125" textAnchor="middle" fill={COLORS[phase]} fontSize="10" fontWeight="600">{PHASES[phase].short}</text>
    </svg>
  );
};

const MinimalVisualization = ({ phase, progress }) => {
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
          transition: (phase===1||phase===3) ? 'transform 0.1s' : 'transform 0.05s linear',
        }}/>
        <div style={{
          fontFamily:'"Fraunces", serif',
          fontSize:36,
          fontWeight:300,
          color:COLORS[phase],
          zIndex:1,
        }}>
          {PHASES[phase].label}
        </div>
      </div>
    </div>
  );
};

const RingVisualization = ({ phase, progress, durations }) => {
  const total = durations.reduce((a,b) => a+b, 0);
  const cx = 120, cy = 120, r = 85;
  
  let cumulative = 0;
  for (let i = 0; i < phase; i++) cumulative += durations[i];
  cumulative += progress * durations[phase];
  const fillAngle = (cumulative / total) * 360;

  const describeArc = (startAngle, endAngle, radius) => {
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
        <path d={describeArc(0, fillAngle, r)} fill="none" stroke={COLORS[phase]} strokeWidth="16" strokeLinecap="round" filter="url(#glow5)"/>
      )}
      <text x="120" y="110" textAnchor="middle" fill={COLORS[phase]} fontSize="14" fontWeight="500">{PHASES[phase].label}</text>
      <text x="120" y="140" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="28" fontWeight="300">{Math.ceil(durations[phase] * (1 - progress))}s</text>
    </svg>
  );
};

const PathVisualization = ({ phase, progress, durations }) => {
  const total = durations.reduce((a,b) => a+b, 0);
  const segmentWidths = durations.map(d => (d/total) * 200);
  
  let cumX = 20;
  const segments = segmentWidths.map((w, i) => {
    const seg = { x1: cumX, x2: cumX + w, i };
    cumX += w;
    return seg;
  });

  let markerX = segments[phase].x1 + (segments[phase].x2 - segments[phase].x1) * progress;

  return (
    <svg viewBox="0 0 240 120" className="viz-svg" style={{maxHeight:160}}>
      <defs><filter id="glow6"><feGaussianBlur stdDeviation="3"/></filter></defs>
      {segments.map(({x1, x2, i}) => (
        <line key={i} x1={x1} y1="60" x2={x2} y2="60" stroke={COLORS[i]} strokeWidth={phase===i?8:4} opacity={phase===i?1:0.4} strokeLinecap="round" style={{transition:'all 0.3s'}}/>
      ))}
      {segments.map(({x1, x2, i}) => (
        <text key={i} x={(x1+x2)/2} y="90" textAnchor="middle" fill={phase===i?COLORS[i]:'rgba(255,255,255,0.3)'} fontSize="10">{PHASES[i].short}</text>
      ))}
      <circle cx={markerX} cy="60" r="12" fill={COLORS[phase]} filter="url(#glow6)" style={{transition:'cx 0.05s linear'}}/>
      <circle cx={markerX} cy="60" r="6" fill="#fff"/>
    </svg>
  );
};

// ============ DURATION STEPPER COMPONENT ============

const DurationStepper = ({ label, value, onChange, min = 0, max = 20, color }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 8,
      borderLeft: `3px solid ${color}`,
    }}>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >−</button>
        <span style={{ 
          width: 40, textAlign: 'center', 
          fontSize: 18, fontWeight: 500, color: '#fff',
          fontVariantNumeric: 'tabular-nums',
        }}>{value}s</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>
      </div>
    </div>
  );
};

// ============ BOX SLIDER COMPONENT ============

const BoxSlider = ({ value, onChange }) => {
  const index = BOX_DURATIONS.indexOf(value);
  
  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: 12,
        padding: '0 4px',
      }}>
        {BOX_DURATIONS.map(d => (
          <span 
            key={d} 
            style={{ 
              fontSize: 12, 
              color: d === value ? '#7dd3c0' : 'rgba(255,255,255,0.3)',
              fontWeight: d === value ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >{d}s</span>
        ))}
      </div>
      <div style={{ position: 'relative', height: 40 }}>
        {/* Track */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          transform: 'translateY(-50%)',
        }} />
        {/* Active track */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: `${(index / (BOX_DURATIONS.length - 1)) * 100}%`,
          height: 4,
          background: '#7dd3c0',
          borderRadius: 2,
          transform: 'translateY(-50%)',
          transition: 'width 0.2s',
        }} />
        {/* Tick marks */}
        {BOX_DURATIONS.map((d, i) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            style={{
              position: 'absolute',
              top: '50%',
              left: `${(i / (BOX_DURATIONS.length - 1)) * 100}%`,
              width: d === value ? 24 : 12,
              height: d === value ? 24 : 12,
              borderRadius: '50%',
              background: i <= index ? '#7dd3c0' : 'rgba(255,255,255,0.2)',
              border: d === value ? '3px solid #fff' : 'none',
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.2s',
              boxShadow: d === value ? '0 2px 8px rgba(125,211,192,0.4)' : 'none',
            }}
          />
        ))}
      </div>
      <div style={{ 
        textAlign: 'center', 
        marginTop: 16,
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
      }}>
        All sides: <span style={{ color: '#7dd3c0', fontWeight: 600 }}>{value} seconds</span>
      </div>
    </div>
  );
};

// ============ MAIN APP ============

export default function BreathingShapes() {
  const [patterns, setPatterns] = useState(DEFAULT_PATTERNS);
  const [activePatternId, setActivePatternId] = useState('box4');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [visualization, setVisualization] = useState('box');
  const [cycle, setCycle] = useState(1);
  const [totalTime, setTotalTime] = useState(0);
  const [haptics, setHaptics] = useState(true);
  const [voice, setVoice] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState('short');
  const [activeTab, setActiveTab] = useState('breathe');
  const [showVizPicker, setShowVizPicker] = useState(false);
  const [showPatternEditor, setShowPatternEditor] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const phaseStartRef = useRef(null);
  const lastSpokenPhase = useRef(-1);
  
  const activePattern = patterns.find(p => p.id === activePatternId) || patterns[0];
  const durations = activePattern.durations;
  const currentDuration = durations[currentPhase];

  const speak = useCallback((text) => {
    if (!voice || typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  }, [voice]);

  const triggerHaptic = useCallback(() => {
    if (haptics && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [haptics]);

  const stopSession = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentPhase(0);
    setPhaseProgress(0);
    setCycle(1);
    lastSpokenPhase.current = -1;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (voice) speak('Session complete');
  }, [voice, speak]);

  const startSession = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentPhase(0);
    setPhaseProgress(0);
    setCycle(1);
    setTotalTime(0);
    startTimeRef.current = Date.now();
    phaseStartRef.current = Date.now();
    lastSpokenPhase.current = -1;
    triggerHaptic();
    if (voice) {
      speak(voiceStyle === 'guided' ? 'Starting breathing session. Breathe in.' : 'Breathe in');
      lastSpokenPhase.current = 0;
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      phaseStartRef.current = Date.now() - (phaseProgress * currentDuration * 1000);
    }
  };

  useEffect(() => {
    if (!isRunning || isPaused) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - phaseStartRef.current) / 1000;
      const phaseDuration = durations[currentPhase];
      
      if (phaseDuration === 0) {
        phaseStartRef.current = now;
        const nextPhase = currentPhase === 3 ? 0 : currentPhase + 1;
        if (currentPhase === 3) setCycle(c => c + 1);
        setCurrentPhase(nextPhase);
        triggerHaptic();
        if (voice && lastSpokenPhase.current !== nextPhase) {
          speak(PHASES[nextPhase].voice);
          lastSpokenPhase.current = nextPhase;
        }
        return;
      }
      
      const progress = Math.min(elapsed / phaseDuration, 1);
      setPhaseProgress(progress);
      setTotalTime(Math.floor((now - startTimeRef.current) / 1000));

      if (progress >= 1) {
        phaseStartRef.current = now;
        const nextPhase = currentPhase === 3 ? 0 : currentPhase + 1;
        if (currentPhase === 3) setCycle(c => c + 1);
        setCurrentPhase(nextPhase);
        triggerHaptic();
        if (voice && lastSpokenPhase.current !== nextPhase) {
          speak(PHASES[nextPhase].voice);
          lastSpokenPhase.current = nextPhase;
        }
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, currentPhase, durations, triggerHaptic, voice, speak]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.ceil(currentDuration * (1 - phaseProgress));

  const renderVisualization = () => {
    const props = { phase: currentPhase, progress: phaseProgress, durations };
    switch (visualization) {
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
  };

  const currentViz = VISUALIZATIONS.find(v => v.id === visualization);

  const openPatternEditor = (type) => {
    if (type === 'box') {
      setEditingPattern({
        id: null,
        name: '',
        type: 'box',
        boxDuration: 4,
        durations: [4, 4, 4, 4],
      });
    } else {
      setEditingPattern({
        id: null,
        name: '',
        type: 'trapezoid',
        durations: [4, 4, 4, 4],
      });
    }
    setShowPatternEditor(true);
  };

  const savePattern = () => {
    if (!editingPattern.name.trim()) {
      alert('Please enter a pattern name');
      return;
    }
    
    const newPattern = {
      ...editingPattern,
      id: editingPattern.id || `custom-${Date.now()}`,
    };
    
    if (editingPattern.id) {
      setPatterns(patterns.map(p => p.id === editingPattern.id ? newPattern : p));
    } else {
      setPatterns([...patterns, newPattern]);
    }
    
    setActivePatternId(newPattern.id);
    setShowPatternEditor(false);
    setEditingPattern(null);
  };

  const deletePattern = (id) => {
    if (patterns.length <= 1) {
      setDeleteConfirm(null);
      return; // Keep at least one pattern
    }
    const newPatterns = patterns.filter(p => p.id !== id);
    setPatterns(newPatterns);
    if (activePatternId === id) {
      setActivePatternId(newPatterns[0].id);
    }
    setDeleteConfirm(null);
  };

  const confirmDelete = (pattern) => {
    setDeleteConfirm(pattern);
  };

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,300;9..144,500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .app {
          min-height: 100vh;
          background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
          font-family: "DM Sans", system-ui, sans-serif;
          color: #e8e8e8;
          display: flex;
          flex-direction: column;
        }
        
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        button:focus { outline: 2px solid #7dd3c0; outline-offset: 2px; }
        
        .header {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        .logo {
          font-family: "Fraunces", serif;
          font-size: 22px;
          font-weight: 500;
          background: linear-gradient(135deg, #7dd3c0, #a8d4e6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        .tab-btn {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          font-weight: 500;
          padding: 12px 20px;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }
        .tab-btn.active { color: #7dd3c0; border-bottom-color: #7dd3c0; }
        
        .main { flex: 1; padding: 20px; overflow: auto; }
        
        .breathe-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        
        .viz-picker-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          transition: all 0.2s;
        }
        .viz-picker-btn:hover { background: rgba(255,255,255,0.1); }
        
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }
        
        .modal-content {
          background: #1a1a2e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 20px;
          max-width: 400px;
          width: 100%;
          max-height: 80vh;
          overflow: auto;
        }
        
        .viz-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
          color: #e8e8e8;
        }
        .viz-option:hover { background: rgba(255,255,255,0.05); }
        .viz-option.active { background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); }
        
        .viz-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
        }
        
        .viz-svg { width: 100%; max-width: 320px; height: auto; }
        .viz-container { display: flex; align-items: center; justify-content: center; width: 100%; max-width: 320px; aspect-ratio: 1; }
        
        .phase-info { text-align: center; }
        .phase-label {
          font-family: "Fraunces", serif;
          font-size: 28px;
          font-weight: 300;
          margin-bottom: 4px;
        }
        .phase-instruction { font-size: 14px; color: rgba(255,255,255,0.4); }
        .phase-timer {
          font-size: 48px;
          font-weight: 300;
          color: rgba(255,255,255,0.8);
          margin-top: 8px;
          font-variant-numeric: tabular-nums;
        }
        
        .controls { display: flex; gap: 16px; margin-top: 8px; }
        .control-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .start-btn {
          background: linear-gradient(135deg, #7dd3c0, #5fb8a5);
          color: #1a1a2e;
          box-shadow: 0 4px 20px rgba(125, 211, 192, 0.3);
        }
        .start-btn:hover { transform: scale(1.05); }
        .pause-btn { background: rgba(255,255,255,0.1); color: #e8e8e8; }
        .stop-btn { background: rgba(232, 196, 184, 0.15); color: #e8c4b8; }
        
        .toggle-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
        }
        .toggle-switch {
          width: 44px;
          height: 24px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }
        .toggle-switch.on { background: rgba(125, 211, 192, 0.3); }
        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .toggle-switch.on::after { transform: translateX(20px); }
        
        .settings-card {
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        
        .pattern-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          color: #e8e8e8;
          text-align: left;
          transition: all 0.2s;
          width: 100%;
        }
        .pattern-card.active {
          background: rgba(125, 211, 192, 0.1);
          border-color: rgba(125, 211, 192, 0.3);
        }
        
        .type-btn {
          flex: 1;
          padding: 20px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #e8e8e8;
          text-align: center;
          transition: all 0.2s;
        }
        .type-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.2);
        }
        
        .input-field {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
        }
        .input-field:focus {
          outline: none;
          border-color: #7dd3c0;
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.3);
        }
        
        .save-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7dd3c0, #5fb8a5);
          border-radius: 8px;
          color: #1a1a2e;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }
        .save-btn:hover { transform: scale(1.02); }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <h1 className="logo">Breathing Shapes</h1>
        {isRunning && (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            Cycle {cycle} • {formatTime(totalTime)}
          </div>
        )}
      </header>

      {/* Tab Navigation */}
      <nav className="tabs">
        {['breathe', 'patterns', 'settings'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main">
        {activeTab === 'breathe' && (
          <div className="breathe-container">
            {/* Visualization Picker Button */}
            <button className="viz-picker-btn" onClick={() => setShowVizPicker(true)}>
              <span style={{fontSize:18}}>{currentViz?.icon}</span>
              <span>{currentViz?.name}</span>
              <span style={{opacity:0.5}}>▼</span>
            </button>

            {/* Active Pattern Display */}
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 20,
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
            }}>
              {activePattern.name} • {activePattern.durations.join('-')}
            </div>

            {/* Visualization */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {renderVisualization()}
            </div>

            {/* Phase Info */}
            <div className="phase-info">
              <div className="phase-label" style={{ color: COLORS[currentPhase] }}>
                {PHASES[currentPhase].label}
              </div>
              <div className="phase-instruction">
                {isRunning ? PHASES[currentPhase].instruction : 'Ready to begin'}
              </div>
              {isRunning && currentDuration > 0 && (
                <div className="phase-timer">{remainingSeconds}</div>
              )}
            </div>

            {/* Controls */}
            <div className="controls">
              {!isRunning ? (
                <button className="control-btn start-btn" onClick={startSession}>Start</button>
              ) : (
                <>
                  <button className="control-btn pause-btn" onClick={togglePause}>{isPaused ? '▶' : '❚❚'}</button>
                  <button className="control-btn stop-btn" onClick={stopSession}>Stop</button>
                </>
              )}
            </div>

            {/* Quick Toggles */}
            <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
              <div className="toggle-row">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Haptics</span>
                <div className={`toggle-switch ${haptics ? 'on' : ''}`} onClick={() => setHaptics(!haptics)} role="switch" aria-checked={haptics} tabIndex={0}/>
              </div>
              <div className="toggle-row">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Voice</span>
                <div className={`toggle-switch ${voice ? 'on' : ''}`} onClick={() => setVoice(!voice)} role="switch" aria-checked={voice} tabIndex={0}/>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 400, marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>
              Breathing Patterns
            </h2>
            
            {/* Create New Pattern Buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button className="type-btn" onClick={() => openPatternEditor('box')}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>◻</div>
                <div style={{ fontWeight: 500 }}>New Box</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Equal sides</div>
              </button>
              <button className="type-btn" onClick={() => openPatternEditor('trapezoid')}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>△</div>
                <div style={{ fontWeight: 500 }}>New Trapezoid</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Custom timing</div>
              </button>
            </div>

            {/* Pattern List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {patterns.map(pattern => (
                <div 
                  key={pattern.id} 
                  className={`pattern-card ${activePatternId === pattern.id ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div onClick={() => { setActivePatternId(pattern.id); setActiveTab('breathe'); }} style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{pattern.type === 'box' ? '◻' : '△'}</span>
                      <span style={{ fontWeight: 500 }}>{pattern.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {pattern.type === 'box' 
                        ? `All sides: ${pattern.boxDuration || pattern.durations[0]}s`
                        : `In ${pattern.durations[0]}s • Hold ${pattern.durations[1]}s • Out ${pattern.durations[2]}s • Hold ${pattern.durations[3]}s`
                      }
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {activePatternId === pattern.id && (
                      <span style={{ color: '#7dd3c0', fontSize: 12 }}>Active</span>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); confirmDelete(pattern); }}
                      style={{ 
                        color: '#e8c4b8', 
                        fontSize: 12, 
                        padding: '6px 10px',
                        background: 'rgba(232, 196, 184, 0.1)',
                        borderRadius: 6,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.target.style.background = 'rgba(232, 196, 184, 0.2)'}
                      onMouseLeave={e => e.target.style.background = 'rgba(232, 196, 184, 0.1)'}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 400, marginBottom: 20, color: 'rgba(255,255,255,0.9)' }}>
              Settings
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Haptics */}
              <div className="settings-card" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>Haptic Feedback</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Vibrate on phase transitions</div>
                </div>
                <div className={`toggle-switch ${haptics ? 'on' : ''}`} onClick={() => setHaptics(!haptics)} role="switch" aria-checked={haptics} tabIndex={0}/>
              </div>
              
              {/* Voice */}
              <div className="settings-card">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:voice?12:0}}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>Voice Prompts</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Announce phase transitions</div>
                  </div>
                  <div className={`toggle-switch ${voice ? 'on' : ''}`} onClick={() => setVoice(!voice)} role="switch" aria-checked={voice} tabIndex={0}/>
                </div>
                {voice && (
                  <div style={{display:'flex',gap:8}}>
                    <button 
                      onClick={() => setVoiceStyle('short')}
                      style={{
                        flex:1,padding:'8px 12px',borderRadius:8,fontSize:12,
                        background: voiceStyle==='short' ? 'rgba(125,211,192,0.15)' : 'rgba(255,255,255,0.05)',
                        border: voiceStyle==='short' ? '1px solid rgba(125,211,192,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        color: voiceStyle==='short' ? '#7dd3c0' : 'rgba(255,255,255,0.6)',
                      }}
                    >Short prompts</button>
                    <button 
                      onClick={() => setVoiceStyle('guided')}
                      style={{
                        flex:1,padding:'8px 12px',borderRadius:8,fontSize:12,
                        background: voiceStyle==='guided' ? 'rgba(125,211,192,0.15)' : 'rgba(255,255,255,0.05)',
                        border: voiceStyle==='guided' ? '1px solid rgba(125,211,192,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        color: voiceStyle==='guided' ? '#7dd3c0' : 'rgba(255,255,255,0.6)',
                      }}
                    >Guided</button>
                  </div>
                )}
              </div>
              
              {/* Default Viz */}
              <div className="settings-card">
                <div style={{ fontWeight: 500, marginBottom: 12 }}>Default Visualization</div>
                <button className="viz-picker-btn" style={{width:'100%',justifyContent:'center'}} onClick={() => setShowVizPicker(true)}>
                  <span style={{fontSize:18}}>{currentViz?.icon}</span>
                  <span>{currentViz?.name}</span>
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: 32, padding: 16, background: 'rgba(125, 211, 192, 0.05)', borderRadius: 12, border: '1px solid rgba(125, 211, 192, 0.1)' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>About</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Breathing Shapes v0.3</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                10 visualizations • Custom patterns • Voice prompts
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Visualization Picker Modal */}
      {showVizPicker && (
        <div className="modal" onClick={() => setShowVizPicker(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{fontFamily:'"Fraunces", serif',fontSize:18,fontWeight:400}}>Choose Visualization</h3>
              <button onClick={() => setShowVizPicker(false)} style={{color:'rgba(255,255,255,0.5)',fontSize:20}}>×</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {VISUALIZATIONS.map(viz => (
                <button 
                  key={viz.id} 
                  className={`viz-option ${visualization === viz.id ? 'active' : ''}`}
                  onClick={() => { setVisualization(viz.id); setShowVizPicker(false); }}
                >
                  <div className="viz-icon">{viz.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,marginBottom:2}}>{viz.name}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{viz.desc}</div>
                  </div>
                  {visualization === viz.id && <span style={{color:'#7dd3c0'}}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pattern Editor Modal */}
      {showPatternEditor && editingPattern && (
        <div className="modal" onClick={() => setShowPatternEditor(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <h3 style={{fontFamily:'"Fraunces", serif',fontSize:18,fontWeight:400}}>
                {editingPattern.type === 'box' ? '◻ New Box Pattern' : '△ New Trapezoid Pattern'}
              </h3>
              <button onClick={() => setShowPatternEditor(false)} style={{color:'rgba(255,255,255,0.5)',fontSize:20}}>×</button>
            </div>

            {/* Pattern Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>
                Pattern Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., My Calm Pattern"
                value={editingPattern.name}
                onChange={e => setEditingPattern({ ...editingPattern, name: e.target.value })}
              />
            </div>

            {/* Box Pattern: Single Slider */}
            {editingPattern.type === 'box' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>
                  Duration per Side
                </label>
                <BoxSlider
                  value={editingPattern.boxDuration}
                  onChange={val => setEditingPattern({
                    ...editingPattern,
                    boxDuration: val,
                    durations: [val, val, val, val],
                  })}
                />
              </div>
            )}

            {/* Trapezoid Pattern: 4 Steppers */}
            {editingPattern.type === 'trapezoid' && (
              <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                  Phase Durations
                </label>
                <DurationStepper
                  label="Breathe In"
                  value={editingPattern.durations[0]}
                  onChange={val => setEditingPattern({
                    ...editingPattern,
                    durations: [val, editingPattern.durations[1], editingPattern.durations[2], editingPattern.durations[3]],
                  })}
                  min={1}
                  color={COLORS[0]}
                />
                <DurationStepper
                  label="Hold 1"
                  value={editingPattern.durations[1]}
                  onChange={val => setEditingPattern({
                    ...editingPattern,
                    durations: [editingPattern.durations[0], val, editingPattern.durations[2], editingPattern.durations[3]],
                  })}
                  min={0}
                  color={COLORS[1]}
                />
                <DurationStepper
                  label="Breathe Out"
                  value={editingPattern.durations[2]}
                  onChange={val => setEditingPattern({
                    ...editingPattern,
                    durations: [editingPattern.durations[0], editingPattern.durations[1], val, editingPattern.durations[3]],
                  })}
                  min={1}
                  color={COLORS[2]}
                />
                <DurationStepper
                  label="Hold 2"
                  value={editingPattern.durations[3]}
                  onChange={val => setEditingPattern({
                    ...editingPattern,
                    durations: [editingPattern.durations[0], editingPattern.durations[1], editingPattern.durations[2], val],
                  })}
                  min={0}
                  color={COLORS[3]}
                />
              </div>
            )}

            {/* Preview */}
            <div style={{
              padding: 16,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Preview</div>
              <div style={{ fontSize: 14, color: '#fff' }}>
                {editingPattern.durations.join(' - ')} seconds
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                Total cycle: {editingPattern.durations.reduce((a, b) => a + b, 0)}s
              </div>
            </div>

            {/* Save Button */}
            <button className="save-btn" onClick={savePattern}>
              Save Pattern
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 340, textAlign: 'center' }}>
            <div style={{ 
              width: 56, 
              height: 56, 
              margin: '0 auto 16px',
              background: patterns.length <= 1 ? 'rgba(168, 212, 230, 0.15)' : 'rgba(232, 196, 184, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}>
              {patterns.length <= 1 ? '⚠️' : '🗑️'}
            </div>
            <h3 style={{ 
              fontFamily: '"Fraunces", serif', 
              fontSize: 20, 
              fontWeight: 400,
              marginBottom: 8,
            }}>
              {patterns.length <= 1 ? 'Cannot Delete' : 'Delete Pattern?'}
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 1.5,
            }}>
              {patterns.length <= 1 
                ? 'You need at least one pattern. Create a new pattern before deleting this one.'
                : <>Are you sure you want to delete "<span style={{ color: '#fff' }}>{deleteConfirm.name}</span>"? This action cannot be undone.</>
              }
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {patterns.length <= 1 ? (
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #7dd3c0, #5fb8a5)',
                    borderRadius: 8,
                    color: '#1a1a2e',
                    fontSize: 14,
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Got It
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deletePattern(deleteConfirm.id)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #e8c4b8, #d4a69a)',
                      borderRadius: 8,
                      color: '#1a1a2e',
                      fontSize: 14,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
