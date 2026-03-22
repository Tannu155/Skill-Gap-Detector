import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoles } from '../../api';

export default function SelectRole() {
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (!u.id) navigate('/login');
    getRoles().then(res => setRoles(res.data.roles));
  }, []);

  const handleStart = () => {
    if (!selected) return alert('Please select a role');
    localStorage.setItem('selected_role', selected);
    navigate('/test');
  };

  const roleIcons = {
    'Data Analyst': '📊',
    'Web Developer': '💻',
    'ML Engineer': '🤖',
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
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <span style={{fontSize:'13px', color:'rgba(255,255,255,0.5)'}}>Hi, {user.name}</span>
            <button style={s.logoutBtn} onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={s.wrap}>
        <div style={s.header} className="fadeUp">
          <h1 style={s.title}>Select Your Role</h1>
          <p style={s.sub}>Choose the role you want to be assessed for</p>
        </div>

        <div style={s.roleGrid} className="fadeUp-1">
          {roles.map((r, i) => (
            <div
              key={r}
              style={{
                ...s.roleCard,
                borderColor: selected === r ? '#667eea' : 'rgba(255,255,255,0.06)',
                background: selected === r ? 'rgba(102,126,234,0.1)' : 'rgba(255,255,255,0.02)',
                transform: selected === r ? 'translateY(-4px)' : 'translateY(0)',
              }}
              onClick={() => setSelected(r)}
              onMouseOver={e => { if (selected !== r) { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.transform='translateY(-2px)'; }}}
              onMouseOut={e => { if (selected !== r) { e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(0)'; }}}
            >
              <div style={s.roleIcon}>{roleIcons[r] || '💼'}</div>
              <div style={s.roleName}>{r}</div>
              <div style={s.roleDesc}>
                {r === 'Data Analyst' && 'Python, SQL, Statistics'}
                {r === 'Web Developer' && 'JavaScript, React'}
                {r === 'ML Engineer' && 'Python, Machine Learning'}
              </div>
              {selected === r && (
                <div style={s.selectedBadge}>Selected ✓</div>
              )}
            </div>
          ))}
        </div>

        <div style={{textAlign:'center'}} className="fadeUp-2">
          <button
            style={{...s.primaryBtn, opacity: selected ? 1 : 0.5}}
            onClick={handleStart}
            onMouseOver={e => { if(selected) { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 8px 30px rgba(102,126,234,0.5)'; }}}
            onMouseOut={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 4px 20px rgba(102,126,234,0.3)'; }}
          >
            Start Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#080818', fontFamily:'Inter, sans-serif', position:'relative', overflow:'hidden' },
  orb1: { position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)', top:'-200px', left:'-200px', pointerEvents:'none' },
  orb2: { position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom:'-100px', right:'-100px', pointerEvents:'none' },
  nav: { position:'relative', zIndex:10, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,24,0.9)', backdropFilter:'blur(20px)' },
  navInner: { maxWidth:'1100px', margin:'0 auto', padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { display:'flex', alignItems:'center', gap:'10px' },
  logoMark: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(102,126,234,0.15)', border:'1px solid rgba(102,126,234,0.3)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoLetters: { fontSize:'13px', fontWeight:'800', background:'linear-gradient(135deg,#667eea,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  logoText: { fontSize:'20px', fontWeight:'700', color:'white', letterSpacing:'-0.5px' },
  logoutBtn: { padding:'6px 16px', background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.5)', borderRadius:'20px', fontSize:'13px', cursor:'pointer', fontFamily:'Inter, sans-serif' },
  wrap: { position:'relative', zIndex:1, maxWidth:'800px', margin:'60px auto', padding:'0 32px' },
  header: { textAlign:'center', marginBottom:'40px' },
  title: { fontSize:'32px', fontWeight:'800', color:'white', marginBottom:'8px', letterSpacing:'-0.5px' },
  sub: { fontSize:'16px', color:'rgba(255,255,255,0.4)' },
  roleGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px', marginBottom:'40px' },
  roleCard: { border:'1px solid', borderRadius:'20px', padding:'28px 24px', cursor:'pointer', transition:'all 0.25s', textAlign:'center' },
  roleIcon: { fontSize:'40px', marginBottom:'16px' },
  roleName: { fontSize:'16px', fontWeight:'700', color:'white', marginBottom:'8px' },
  roleDesc: { fontSize:'13px', color:'rgba(255,255,255,0.35)', lineHeight:'1.5' },
  selectedBadge: { display:'inline-block', marginTop:'12px', background:'rgba(102,126,234,0.2)', border:'1px solid rgba(102,126,234,0.4)', color:'#a5b4fc', padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' },
  primaryBtn: { padding:'14px 48px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', borderRadius:'14px', fontSize:'16px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 4px 20px rgba(102,126,234,0.3)', fontFamily:'Inter, sans-serif' },
};
