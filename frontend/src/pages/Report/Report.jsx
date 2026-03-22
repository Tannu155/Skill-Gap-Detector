import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Report() {
  const navigate = useNavigate();
  const report = JSON.parse(localStorage.getItem('report') || '{}');

  if (!report.summary) return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#080818', color:'white', flexDirection:'column', gap:'16px', fontFamily:'Inter, sans-serif'}}>
      <p>No report found.</p>
      <button onClick={() => navigate('/')} style={{padding:'10px 24px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontFamily:'Inter, sans-serif'}}>Go Home</button>
    </div>
  );

  const { employee_name, role, summary, gaps = [], learning_path = [], skills_met = [] } = report;

  const readiness = Math.round((summary.skills_met / summary.total_skills_required) * 100);

  const chartData = [
    ...gaps.map(g => ({ skill: g.skill, yours: 1, required: g.required_level === 'Advanced' ? 3 : g.required_level === 'Intermediate' ? 2 : 1 })),
    ...skills_met.map(s => ({ skill: s.skill, yours: 2, required: 2 }))
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{background:'rgba(15,15,35,0.95)', border:'1px solid rgba(102,126,234,0.3)', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'white'}}>
          <p style={{marginBottom:'4px', fontWeight:'600'}}>{label}</p>
          {payload.map(p => <p key={p.name} style={{color: p.name === 'yours' ? '#818cf8' : '#667eea'}}>{p.name}: {['','Beginner','Intermediate','Advanced'][p.value]}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={s.page}>
      <div style={s.orb1}/><div style={s.orb2}/>

      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoMark}><span style={s.logoLetters}>SG</span></div>
            <span style={s.logoText}>SkillGap<span style={{color:'#667eea'}}>.</span></span>
          </div>
          <div style={{display:'flex', gap:'12px'}}>
            <button style={s.navBtn} onClick={() => navigate('/')}
              onMouseOver={e => e.target.style.borderColor='rgba(255,255,255,0.3)'}
              onMouseOut={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
            >New Assessment</button>
            <button style={{...s.navBtn, background:'rgba(102,126,234,0.15)', borderColor:'rgba(102,126,234,0.3)', color:'#a5b4fc'}} onClick={() => navigate('/hr')}>HR Dashboard</button>
          </div>
        </div>
      </nav>

      <div style={s.wrap}>

        {/* Profile Header */}
        <div style={s.profileCard} className="fadeUp">
          <div style={s.avatar}>{employee_name.charAt(0)}</div>
          <div style={{flex:1}}>
            <h1 style={s.empName}>{employee_name}</h1>
            <p style={s.empRole}>{role}</p>
          </div>
          <div style={s.readinessBox}>
            <div style={{...s.readinessNum, color: readiness >= 70 ? '#34d399' : readiness >= 40 ? '#f59e0b' : '#f87171'}}>{readiness}%</div>
            <div style={s.readinessLabel}>Role Readiness</div>
            <div style={s.readinessBar}>
              <div style={{...s.readinessFill, width:`${readiness}%`, background: readiness >= 70 ? 'linear-gradient(90deg,#34d399,#10b981)' : readiness >= 40 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#f87171,#ef4444)'}}/>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsRow} className="fadeUp-1">
          {[
            ['Skill Gaps', summary.gaps_found, '#f87171', 'rgba(248,113,113,0.1)'],
            ['Skills Met', summary.skills_met, '#34d399', 'rgba(52,211,153,0.1)'],
            ['Courses', summary.total_courses, '#a78bfa', 'rgba(167,139,250,0.1)'],
            ['Hours Needed', summary.total_hours, '#fbbf24', 'rgba(251,191,36,0.1)'],
            ['Est. Weeks', summary.estimated_weeks, '#60a5fa', 'rgba(96,165,250,0.1)'],
          ].map(([label, val, color, bg]) => (
            <div key={label} style={{...s.statBox, background:bg, border:`1px solid ${color}20`}}>
              <div style={{...s.statNum, color}}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* AI Explanation */}
        {report.ai_explanation && (
          <div style={s.aiCard} className="fadeUp-2">
            <div style={s.aiHeader}>
              <div style={s.aiIcon}>AI</div>
              <div>
                <div style={s.aiTitle}>AI Advisor Analysis</div>
                <div style={s.aiSub}>Personalized insight by Llama 3.3</div>
              </div>
            </div>
            <p style={s.aiText}>{report.ai_explanation}</p>
          </div>
        )}

        <div style={s.grid} className="fadeUp-3">
          {/* Chart */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Skill Comparison</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={24}>
                <XAxis dataKey="skill" tick={{fontSize:10, fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,3]} ticks={[1,2,3]} tickFormatter={v => ['','Beg','Int','Adv'][v]} tick={{fontSize:10, fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:'12px', color:'rgba(255,255,255,0.5)'}}/>
                <Bar dataKey="yours" name="Yours" fill="#818cf8" radius={[4,4,0,0]}/>
                <Bar dataKey="required" name="Required" fill="#667eea" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gaps */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Gap Summary</h2>
            {gaps.map((g, i) => (
              <div key={i} style={s.gapRow}>
                <div style={{flex:1}}>
                  <div style={s.gapSkill}>{g.skill}</div>
                  <div style={s.gapLevels}>{g.your_level} → {g.required_level}</div>
                </div>
                <span style={{...s.impactBadge, background: g.impact_label==='Critical' ? 'rgba(248,113,113,0.15)' : g.impact_label==='High' ? 'rgba(251,191,36,0.15)' : 'rgba(167,139,250,0.15)', color: g.impact_label==='Critical' ? '#f87171' : g.impact_label==='High' ? '#fbbf24' : '#a78bfa', border:`1px solid ${g.impact_label==='Critical' ? '#f8717130' : g.impact_label==='High' ? '#fbbf2430' : '#a78bfa30'}`}}>{g.impact_label}</span>
              </div>
            ))}
            {skills_met.map((sm, i) => (
              <div key={i} style={s.gapRow}>
                <div style={{flex:1}}>
                  <div style={s.gapSkill}>{sm.skill}</div>
                  <div style={s.gapLevels}>Requirement met</div>
                </div>
                <span style={{...s.impactBadge, background:'rgba(52,211,153,0.15)', color:'#34d399', border:'1px solid rgba(52,211,153,0.3)'}}>Met ✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div style={{...s.section, marginBottom:'16px'}} className="fadeUp-4">
          <h2 style={s.sectionTitle}>Your Personalized Learning Path</h2>
          <p style={{fontSize:'13px', color:'rgba(255,255,255,0.3)', marginBottom:'20px'}}>Ordered by impact — fix critical gaps first</p>
          {learning_path.map((item, i) => (
            <div key={i} style={s.courseCard}
              onMouseOver={e => { e.currentTarget.style.background='rgba(102,126,234,0.06)'; e.currentTarget.style.borderColor='rgba(102,126,234,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}
            >
              <div style={s.courseNum}>{item.priority}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'6px'}}>
                  <span style={s.courseTitle}>{item.course_title}</span>
                  <span style={{...s.impactBadge, background: item.impact_label==='Critical' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)', color: item.impact_label==='Critical' ? '#f87171' : '#fbbf24', border:`1px solid ${item.impact_label==='Critical' ? '#f8717130' : '#fbbf2430'}`}}>{item.impact_label}</span>
                </div>
                <div style={s.courseMeta}>
                  <span style={s.platformBadge}>{item.platform}</span>
                  <span>{item.duration_hours} hrs</span>
                  <span>·</span>
                  <span>{item.your_level} → {item.target_level}</span>
                </div>
                <p style={s.courseWhy}>{item.why}</p>
                <a href={item.url} target="_blank" rel="noreferrer" style={s.courseLink}
                  onMouseOver={e => e.target.style.gap='8px'}
                  onMouseOut={e => e.target.style.gap='4px'}
                >View Course →</a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={s.actions}>
          <button style={s.primaryBtn} onClick={() => navigate('/')}
            onMouseOver={e => { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 8px 30px rgba(102,126,234,0.5)'; }}
            onMouseOut={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 4px 20px rgba(102,126,234,0.3)'; }}
          >Take Another Assessment</button>
          <button style={s.secondaryBtn} onClick={() => navigate('/hr')}
            onMouseOver={e => { e.target.style.background='rgba(255,255,255,0.06)'; }}
            onMouseOut={e => { e.target.style.background='transparent'; }}
          >View HR Dashboard</button>
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#080818', fontFamily:'Inter, sans-serif', position:'relative', overflow:'hidden' },
  orb1: { position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)', top:'-200px', right:'-100px', pointerEvents:'none' },
  orb2: { position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)', bottom:'0', left:'-100px', pointerEvents:'none' },
  nav: { position:'relative', zIndex:10, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,24,0.9)', backdropFilter:'blur(20px)' },
  navInner: { maxWidth:'1000px', margin:'0 auto', padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { display:'flex', alignItems:'center', gap:'10px' },
  logoMark: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(102,126,234,0.15)', border:'1px solid rgba(102,126,234,0.3)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoLetters: { fontSize:'13px', fontWeight:'800', background:'linear-gradient(135deg,#667eea,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  logoText: { fontSize:'20px', fontWeight:'700', color:'white', letterSpacing:'-0.5px' },
  navBtn: { padding:'8px 18px', background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', borderRadius:'20px', fontSize:'13px', cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif' },
  wrap: { position:'relative', zIndex:1, maxWidth:'900px', margin:'40px auto', padding:'0 32px 80px' },
  profileCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'24px 28px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'20px', backdropFilter:'blur(10px)' },
  avatar: { width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'700', flexShrink:0 },
  empName: { fontSize:'22px', fontWeight:'700', color:'white', marginBottom:'4px', letterSpacing:'-0.5px' },
  empRole: { fontSize:'14px', color:'rgba(255,255,255,0.4)' },
  readinessBox: { textAlign:'center', minWidth:'120px' },
  readinessNum: { fontSize:'32px', fontWeight:'800', letterSpacing:'-1px' },
  readinessLabel: { fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' },
  readinessBar: { background:'rgba(255,255,255,0.08)', borderRadius:'4px', height:'4px', overflow:'hidden' },
  readinessFill: { height:'4px', borderRadius:'4px', transition:'width 1s ease' },
  statsRow: { display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' },
  statBox: { flex:'1', minWidth:'100px', borderRadius:'14px', padding:'16px 12px', textAlign:'center' },
  statNum: { fontSize:'24px', fontWeight:'700', letterSpacing:'-0.5px' },
  statLabel: { fontSize:'10px', color:'rgba(255,255,255,0.4)', marginTop:'4px', fontWeight:'500' },
  aiCard: { background:'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(167,139,250,0.05))', border:'1px solid rgba(102,126,234,0.2)', borderRadius:'20px', padding:'24px 28px', marginBottom:'16px' },
  aiHeader: { display:'flex', alignItems:'center', gap:'14px', marginBottom:'14px' },
  aiIcon: { width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#667eea,#764ba2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'white' },
  aiTitle: { fontSize:'14px', fontWeight:'600', color:'#a5b4fc' },
  aiSub: { fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'2px' },
  aiText: { fontSize:'15px', color:'rgba(255,255,255,0.75)', lineHeight:'1.8' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' },
  section: { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'24px', backdropFilter:'blur(10px)' },
  sectionTitle: { fontSize:'15px', fontWeight:'600', color:'white', marginBottom:'16px' },
  gapRow: { display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' },
  gapSkill: { fontSize:'13px', fontWeight:'500', color:'white', marginBottom:'2px' },
  gapLevels: { fontSize:'11px', color:'rgba(255,255,255,0.35)' },
  impactBadge: { padding:'3px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'500', whiteSpace:'nowrap' },
  courseCard: { display:'flex', gap:'18px', padding:'18px', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', marginBottom:'10px', background:'rgba(255,255,255,0.02)', transition:'all 0.2s', cursor:'default' },
  courseNum: { width:'34px', height:'34px', borderRadius:'10px', background:'rgba(102,126,234,0.15)', border:'1px solid rgba(102,126,234,0.25)', color:'#a5b4fc', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', flexShrink:0 },
  courseTitle: { fontSize:'14px', fontWeight:'600', color:'white' },
  courseMeta: { display:'flex', gap:'8px', fontSize:'12px', color:'rgba(255,255,255,0.35)', marginBottom:'6px', flexWrap:'wrap', alignItems:'center' },
  platformBadge: { background:'rgba(255,255,255,0.06)', padding:'1px 8px', borderRadius:'8px', fontSize:'11px' },
  courseWhy: { fontSize:'12px', color:'rgba(255,255,255,0.35)', lineHeight:'1.6', marginBottom:'10px' },
  courseLink: { fontSize:'13px', color:'#667eea', fontWeight:'500', textDecoration:'none', transition:'gap 0.2s' },
  actions: { display:'flex', gap:'12px', justifyContent:'center', marginTop:'32px' },
  primaryBtn: { padding:'13px 32px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', borderRadius:'14px', fontSize:'14px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 4px 20px rgba(102,126,234,0.3)', fontFamily:'Inter, sans-serif' },
  secondaryBtn: { padding:'13px 32px', background:'transparent', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'14px', fontSize:'14px', fontWeight:'500', cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif' },
};
