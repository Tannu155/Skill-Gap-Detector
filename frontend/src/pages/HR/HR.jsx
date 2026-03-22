import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReports, clearReports, deleteReport } from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function HR() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const res = await getAllReports();
      setReports(res.data.reports);
      setDone(true);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (e, r, i) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${r.employee_name}'s report?`)) {
      await deleteReport(r.db_id);
      setReports(reports.filter((_, idx) => idx !== i));
      if (selected === i) setSelected(null);
    }
  };

  const chartData = reports.map(r => ({
    name: r.employee_name.split(' ')[0],
    gaps: r.summary.gaps_found,
    met: r.summary.skills_met,
  }));

  return (
    <div style={s.page}>
      <div style={s.orb1}/><div style={s.orb2}/>

      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoMark}><span style={s.logoLetters}>SG</span></div>
            <span style={s.logoText}>SkillGap<span style={{color:'#667eea'}}>.</span></span>
          </div>
          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            <button style={s.navBtn} onClick={() => navigate('/')}
              onMouseOver={e => e.target.style.borderColor='rgba(255,255,255,0.3)'}
              onMouseOut={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
            >Employee View</button>
            <button style={{...s.navBtn, background:'rgba(102,126,234,0.15)', borderColor:'rgba(102,126,234,0.3)', color:'#a5b4fc'}} onClick={loadAllReports} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            <button style={{...s.navBtn, color:'#f87171', borderColor:'rgba(248,113,113,0.3)'}}
              onClick={async () => { if(window.confirm('Clear all reports?')) { await clearReports(); setReports([]); setDone(false); }}}
              onMouseOver={e => e.target.style.background='rgba(248,113,113,0.08)'}
              onMouseOut={e => e.target.style.background='transparent'}
            >Clear All</button>
          </div>
        </div>
      </nav>

      <div style={s.wrap}>
        <div style={s.pageHeader} className="fadeUp">
          <div>
            <h1 style={s.pageTitle}>HR Dashboard</h1>
            <p style={s.pageSub}>Monitor team skill gaps and track learning progress</p>
          </div>
          {done && <div style={s.totalBadge}>{reports.length} Employee{reports.length !== 1 ? 's' : ''}</div>}
        </div>

        {!done && !loading && (
          <div style={s.emptyState} className="fadeIn">
            <div style={s.emptyOrb}/>
            <div style={s.emptyIcon}>📊</div>
            <h2 style={s.emptyTitle}>No Data Loaded</h2>
            <p style={s.emptySub}>Click Refresh Data to load employee assessments</p>
            <button style={s.primaryBtn} onClick={loadAllReports}
              onMouseOver={e => { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 8px 30px rgba(102,126,234,0.4)'; }}
              onMouseOut={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 4px 20px rgba(102,126,234,0.3)'; }}
            >Load Team Reports</button>
          </div>
        )}

        {loading && (
          <div style={s.emptyState}>
            <div style={{width:'40px', height:'40px', border:'3px solid rgba(102,126,234,0.2)', borderTop:'3px solid #667eea', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 1s linear infinite'}}/>
            <p style={{color:'rgba(255,255,255,0.5)', fontSize:'14px'}}>Loading team reports...</p>
          </div>
        )}

        {done && reports.length === 0 && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>👥</div>
            <h2 style={s.emptyTitle}>No Assessments Yet</h2>
            <p style={s.emptySub}>Ask your team to complete the skill assessment first</p>
            <button style={s.primaryBtn} onClick={() => navigate('/')}>Go to Assessment</button>
          </div>
        )}

        {done && reports.length > 0 && (
          <>
            {/* Stats */}
            <div style={s.statsRow} className="fadeUp-1">
              {[
                ['Total Assessed', reports.length, '#a78bfa', 'rgba(167,139,250,0.1)', 'rgba(167,139,250,0.2)'],
                ['Avg Skill Gaps', (reports.reduce((a,r) => a + r.summary.gaps_found, 0) / reports.length).toFixed(1), '#f87171', 'rgba(248,113,113,0.1)', 'rgba(248,113,113,0.2)'],
                ['Avg Hours Needed', (reports.reduce((a,r) => a + r.summary.total_hours, 0) / reports.length).toFixed(0), '#fbbf24', 'rgba(251,191,36,0.1)', 'rgba(251,191,36,0.2)'],
                ['Role Ready', reports.filter(r => r.summary.gaps_found === 0).length, '#34d399', 'rgba(52,211,153,0.1)', 'rgba(52,211,153,0.2)'],
              ].map(([label, val, color, bg, border]) => (
                <div key={label} style={{...s.statBox, background:bg, border:`1px solid ${border}`}}>
                  <div style={{...s.statNum, color}}>{val}</div>
                  <div style={s.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={s.section} className="fadeUp-2">
              <h2 style={s.sectionTitle}>Team Overview</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barSize={32}>
                  <XAxis dataKey="name" tick={{fontSize:12, fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11, fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:'rgba(15,15,35,0.95)', border:'1px solid rgba(102,126,234,0.3)', borderRadius:'10px', color:'white', fontSize:'12px'}}/>
                  <Legend wrapperStyle={{fontSize:'12px', color:'rgba(255,255,255,0.5)'}}/>
                  <Bar dataKey="gaps" name="Skill Gaps" fill="#f87171" radius={[6,6,0,0]}/>
                  <Bar dataKey="met" name="Skills Met" fill="#34d399" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Employee Cards */}
            <div style={s.section} className="fadeUp-3">
              <h2 style={s.sectionTitle}>Employee Reports</h2>
              <div style={s.empGrid}>
                {reports.map((r, i) => (
                  <div key={i}
                    style={{...s.empCard, borderColor: selected===i ? 'rgba(102,126,234,0.4)' : 'rgba(255,255,255,0.06)', background: selected===i ? 'rgba(102,126,234,0.06)' : 'rgba(255,255,255,0.02)'}}
                    onClick={() => setSelected(selected===i ? null : i)}
                    onMouseOver={e => { if(selected!==i) { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.transform='translateY(-2px)'; }}}
                    onMouseOut={e => { if(selected!==i) { e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(0)'; }}}
                  >
                    <div style={s.empTop}>
                      <div style={s.empAvatar}>{r.employee_name.charAt(0)}</div>
                      <div style={{flex:1}}>
                        <div style={s.empName}>{r.employee_name}</div>
                        <div style={s.empRole}>{r.role}</div>
                      </div>
                      <div style={{...s.readiness, color: r.summary.gaps_found===0 ? '#34d399' : r.summary.gaps_found<=2 ? '#fbbf24' : '#f87171'}}>
                        {Math.round((r.summary.skills_met/r.summary.total_skills_required)*100)}%
                      </div>
                    </div>

                    <div style={s.empBadges}>
                      <span style={{...s.badge, background:'rgba(248,113,113,0.15)', color:'#f87171'}}>{r.summary.gaps_found} gaps</span>
                      <span style={{...s.badge, background:'rgba(52,211,153,0.15)', color:'#34d399'}}>{r.summary.skills_met} met</span>
                      <span style={{...s.badge, background:'rgba(251,191,36,0.15)', color:'#fbbf24'}}>{r.summary.total_hours}hrs</span>
                    </div>

                    {selected===i && r.gaps.length > 0 && (
                      <div style={s.gapList}>
                        <p style={s.gapListTitle}>Skill Gaps:</p>
                        {r.gaps.map((g, j) => (
                          <div key={j} style={s.gapItem}>
                            <span style={s.gapSkill}>{g.skill}</span>
                            <span style={s.gapLevel}>{g.your_level} → {g.required_level}</span>
                            <span style={{...s.badge, background: g.impact_label==='Critical' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)', color: g.impact_label==='Critical' ? '#f87171' : '#fbbf24'}}>{g.impact_label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selected===i && r.ai_explanation && (
                      <div style={s.aiSnippet}>
                        <span style={{fontSize:'10px', color:'#a5b4fc', fontWeight:'600'}}>AI INSIGHT</span>
                        <p style={{fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:'1.6', marginTop:'4px'}}>{r.ai_explanation}</p>
                      </div>
                    )}

                    <button style={s.deleteBtn}
                      onClick={(e) => handleDelete(e, r, i)}
                      onMouseOver={e => { e.target.style.background='rgba(248,113,113,0.15)'; e.target.style.color='#f87171'; }}
                      onMouseOut={e => { e.target.style.background='transparent'; e.target.style.color='rgba(255,255,255,0.3)'; }}
                    >Delete Record</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#080818', fontFamily:'Inter, sans-serif', position:'relative', overflow:'hidden' },
  orb1: { position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)', top:'-200px', left:'-200px', pointerEvents:'none' },
  orb2: { position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom:'-100px', right:'-100px', pointerEvents:'none' },
  nav: { position:'relative', zIndex:10, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,24,0.9)', backdropFilter:'blur(20px)' },
  navInner: { maxWidth:'1100px', margin:'0 auto', padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { display:'flex', alignItems:'center', gap:'10px' },
  logoMark: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(102,126,234,0.15)', border:'1px solid rgba(102,126,234,0.3)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoLetters: { fontSize:'13px', fontWeight:'800', background:'linear-gradient(135deg,#667eea,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  logoText: { fontSize:'20px', fontWeight:'700', color:'white', letterSpacing:'-0.5px' },
  navBtn: { padding:'8px 18px', background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', borderRadius:'20px', fontSize:'13px', cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif' },
  wrap: { position:'relative', zIndex:1, maxWidth:'1000px', margin:'40px auto', padding:'0 32px 80px' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' },
  pageTitle: { fontSize:'28px', fontWeight:'800', color:'white', marginBottom:'4px', letterSpacing:'-0.5px' },
  pageSub: { fontSize:'14px', color:'rgba(255,255,255,0.4)' },
  totalBadge: { background:'rgba(102,126,234,0.15)', border:'1px solid rgba(102,126,234,0.3)', color:'#a5b4fc', padding:'6px 16px', borderRadius:'20px', fontSize:'13px', fontWeight:'500' },
  emptyState: { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'80px 24px', textAlign:'center', position:'relative', overflow:'hidden' },
  emptyOrb: { position:'absolute', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' },
  emptyIcon: { fontSize:'48px', marginBottom:'16px', position:'relative' },
  emptyTitle: { fontSize:'20px', fontWeight:'700', color:'white', marginBottom:'8px' },
  emptySub: { fontSize:'14px', color:'rgba(255,255,255,0.35)', marginBottom:'28px' },
  primaryBtn: { padding:'12px 28px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', borderRadius:'14px', fontSize:'14px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 4px 20px rgba(102,126,234,0.3)', fontFamily:'Inter, sans-serif' },
  statsRow: { display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' },
  statBox: { flex:'1', minWidth:'120px', borderRadius:'16px', padding:'18px 14px', textAlign:'center' },
  statNum: { fontSize:'26px', fontWeight:'800', letterSpacing:'-0.5px' },
  statLabel: { fontSize:'10px', color:'rgba(255,255,255,0.4)', marginTop:'4px', fontWeight:'500' },
  section: { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'24px', marginBottom:'16px', backdropFilter:'blur(10px)' },
  sectionTitle: { fontSize:'16px', fontWeight:'600', color:'white', marginBottom:'20px' },
  empGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  empCard: { borderRadius:'16px', padding:'18px', cursor:'pointer', transition:'all 0.25s', border:'1px solid' },
  empTop: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' },
  empAvatar: { width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'700', flexShrink:0 },
  empName: { fontSize:'14px', fontWeight:'600', color:'white', marginBottom:'2px' },
  empRole: { fontSize:'12px', color:'rgba(255,255,255,0.4)' },
  readiness: { fontSize:'20px', fontWeight:'800', letterSpacing:'-0.5px' },
  empBadges: { display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' },
  badge: { padding:'3px 9px', borderRadius:'10px', fontSize:'11px', fontWeight:'500' },
  gapList: { borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px', marginTop:'4px' },
  gapListTitle: { fontSize:'11px', color:'rgba(255,255,255,0.3)', fontWeight:'600', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.08em' },
  gapItem: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' },
  gapSkill: { fontSize:'12px', fontWeight:'500', color:'rgba(255,255,255,0.7)', flex:1 },
  gapLevel: { fontSize:'11px', color:'rgba(255,255,255,0.3)' },
  aiSnippet: { background:'rgba(102,126,234,0.06)', border:'1px solid rgba(102,126,234,0.15)', borderRadius:'10px', padding:'10px 12px', marginTop:'10px' },
  deleteBtn: { width:'100%', marginTop:'12px', padding:'7px', background:'transparent', color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', fontSize:'12px', cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif' },
};
