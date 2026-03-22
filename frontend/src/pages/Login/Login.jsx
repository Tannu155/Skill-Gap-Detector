import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) return setError('Please fill all fields');
    if (isRegister && !name) return setError('Please enter your name');
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await axios.post('http://localhost:8000/api/auth/register', {
          name, email, password, is_hr: isHR
        });
        setIsRegister(false);
        setError('');
        alert('Registered! Please login now.');
      } else {
        const res = await axios.post('http://localhost:8000/api/auth/login', {
          email, password
        });
        const user = res.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('employee_name', user.name);
        if (user.is_hr) {
          navigate('/hr');
        } else {
          navigate('/select-role');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.orb1}/><div style={s.orb2}/>

      <div style={s.wrap}>
        <div style={s.logoRow}>
          <div style={s.logoMark}><span style={s.logoLetters}>SG</span></div>
          <span style={s.logoText}>SkillGap<span style={{color:'#667eea'}}>.</span></span>
        </div>

        <div style={s.card} className="fadeIn">
          <div style={s.tabs}>
            <button
              style={{...s.tab, ...(isRegister ? {} : s.tabActive)}}
              onClick={() => { setIsRegister(false); setError(''); }}
            >Sign In</button>
            <button
              style={{...s.tab, ...(isRegister ? s.tabActive : {})}}
              onClick={() => { setIsRegister(true); setError(''); }}
            >Register</button>
          </div>

          <h2 style={s.title}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={s.subtitle}>
            {isRegister
              ? 'Join SkillGap to discover your skill gaps'
              : 'Sign in to continue your assessment'}
          </p>

          {isRegister && (
            <div style={s.field}>
              <label style={s.label}>Full Name</label>
              <input
                style={s.input}
                placeholder="Rahul Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={e => e.target.style.borderColor='#667eea'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input
              style={s.input}
              type="email"
              placeholder="rahul@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor='#667eea'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor='#667eea'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {isRegister && (
            <div style={s.hrToggle}>
              <div style={s.hrToggleLeft}>
                <div style={s.hrIcon}>👔</div>
                <div>
                  <div style={s.hrTitle}>HR Admin Account</div>
                  <div style={s.hrSub}>Access team dashboard and reports</div>
                </div>
              </div>
              <div
                style={{...s.toggle, background: isHR ? '#667eea' : 'rgba(255,255,255,0.1)'}}
                onClick={() => setIsHR(!isHR)}
              >
                <div style={{...s.toggleDot, transform: isHR ? 'translateX(20px)' : 'translateX(0)'}}/>
              </div>
            </div>
          )}

          {error && (
            <div style={s.error}>
              {error}
            </div>
          )}

          <button
            style={s.primaryBtn}
            onClick={handleSubmit}
            disabled={loading}
            onMouseOver={e => { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 8px 30px rgba(102,126,234,0.5)'; }}
            onMouseOut={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 4px 20px rgba(102,126,234,0.3)'; }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <div style={s.demoBox}>
            <p style={s.demoTitle}>Demo Accounts</p>
            <div style={s.demoAccounts}>
              <div style={s.demoItem} onClick={() => { setEmail('employee@demo.com'); setPassword('demo123'); setIsRegister(false); }}>
                <span style={s.demoRole}>👤 Employee</span>
                <span style={s.demoCredits}>employee@demo.com / demo123</span>
              </div>
              <div style={s.demoItem} onClick={() => { setEmail('hr@demo.com'); setPassword('demo123'); setIsRegister(false); }}>
                <span style={s.demoRole}>👔 HR Admin</span>
                <span style={s.demoCredits}>hr@demo.com / demo123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#080818', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif', position:'relative', overflow:'hidden' },
  orb1: { position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%)', top:'-200px', left:'-200px', pointerEvents:'none' },
  orb2: { position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', bottom:'-100px', right:'-100px', pointerEvents:'none' },
  wrap: { position:'relative', zIndex:1, width:'100%', maxWidth:'420px', padding:'24px' },
  logoRow: { display:'flex', alignItems:'center', gap:'10px', justifyContent:'center', marginBottom:'32px' },
  logoMark: { width:'40px', height:'40px', borderRadius:'12px', background:'rgba(102,126,234,0.15)', border:'1px solid rgba(102,126,234,0.3)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoLetters: { fontSize:'15px', fontWeight:'800', background:'linear-gradient(135deg,#667eea,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  logoText: { fontSize:'24px', fontWeight:'700', color:'white', letterSpacing:'-0.5px' },
  card: { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'32px' },
  tabs: { display:'flex', background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'4px', marginBottom:'28px' },
  tab: { flex:1, padding:'8px', border:'none', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:'14px', fontWeight:'500', cursor:'pointer', borderRadius:'8px', transition:'all 0.2s', fontFamily:'Inter, sans-serif' },
  tabActive: { background:'rgba(102,126,234,0.3)', color:'white' },
  title: { fontSize:'22px', fontWeight:'700', color:'white', marginBottom:'6px', letterSpacing:'-0.5px' },
  subtitle: { fontSize:'13px', color:'rgba(255,255,255,0.4)', marginBottom:'24px' },
  field: { marginBottom:'16px' },
  label: { display:'block', fontSize:'12px', fontWeight:'500', color:'rgba(255,255,255,0.5)', marginBottom:'8px', letterSpacing:'0.05em', textTransform:'uppercase' },
  input: { width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white', fontSize:'14px', fontFamily:'Inter, sans-serif', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' },
  hrToggle: { display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(102,126,234,0.06)', border:'1px solid rgba(102,126,234,0.15)', borderRadius:'12px', padding:'14px 16px', marginBottom:'16px' },
  hrToggleLeft: { display:'flex', alignItems:'center', gap:'12px' },
  hrIcon: { fontSize:'20px' },
  hrTitle: { fontSize:'13px', fontWeight:'600', color:'white', marginBottom:'2px' },
  hrSub: { fontSize:'11px', color:'rgba(255,255,255,0.4)' },
  toggle: { width:'44px', height:'24px', borderRadius:'12px', cursor:'pointer', position:'relative', transition:'background 0.3s', flexShrink:0 },
  toggleDot: { width:'18px', height:'18px', borderRadius:'50%', background:'white', position:'absolute', top:'3px', left:'3px', transition:'transform 0.3s' },
  error: { background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#f87171', marginBottom:'16px' },
  primaryBtn: { width:'100%', padding:'14px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', borderRadius:'14px', fontSize:'15px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 4px 20px rgba(102,126,234,0.3)', fontFamily:'Inter, sans-serif', marginBottom:'20px' },
  demoBox: { borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'20px' },
  demoTitle: { fontSize:'11px', color:'rgba(255,255,255,0.3)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' },
  demoAccounts: { display:'flex', flexDirection:'column', gap:'8px' },
  demoItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', cursor:'pointer', transition:'all 0.2s' },
  demoRole: { fontSize:'12px', fontWeight:'600', color:'rgba(255,255,255,0.7)' },
  demoCredits: { fontSize:'11px', color:'rgba(255,255,255,0.35)', fontFamily:'monospace' },
};
