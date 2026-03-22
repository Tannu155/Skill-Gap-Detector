import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function LoadingSkills() {
  const [status, setStatus] = useState('AI is analyzing your role...');
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();

  const role = localStorage.getItem('selected_role');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setStatus(`AI is detecting skills for "${role}"...`);
      const res = await axios.get(`${API_URL}/universal/skills-for-role/${encodeURIComponent(role)}`);
      const detectedSkills = res.data.required_skills;
      setSkills(detectedSkills);
      localStorage.setItem('required_skills', JSON.stringify(detectedSkills));
      setStatus('Skills detected! Starting assessment...');
      setTimeout(() => navigate('/universal-test'), 1500);
    } catch (err) {
      setStatus('Error detecting skills. Please try again.');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.orb1}/><div style={s.orb2}/>
      <div style={s.wrap}>
        <div style={s.card} className="fadeIn">
          <div style={s.spinner}/>
          <h2 style={s.title}>{status}</h2>
          <p style={s.sub}>Role: {role}</p>

          {skills.length > 0 && (
            <div style={s.skillsList}>
              <p style={s.skillsTitle}>Skills detected:</p>
              {skills.map((sk, i) => (
                <div key={i} style={s.skillItem}>
                  <span style={s.skillName}>{sk.skill}</span>
                  <span style={{
                    ...s.skillBadge,
                    background: sk.required_level === 'Advanced' ? 'rgba(248,113,113,0.15)' : sk.required_level === 'Intermediate' ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
                    color: sk.required_level === 'Advanced' ? '#f87171' : sk.required_level === 'Intermediate' ? '#fbbf24' : '#34d399'
                  }}>{sk.required_level}</span>
                  <span style={s.skillImportance}>{sk.importance}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#080818', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif', position:'relative' },
  orb1: { position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)', top:'-200px', left:'-200px', pointerEvents:'none' },
  orb2: { position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom:'-100px', right:'-100px', pointerEvents:'none' },
  wrap: { position:'relative', zIndex:1, width:'100%', maxWidth:'480px', padding:'24px' },
  card: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'40px', textAlign:'center', backdropFilter:'blur(20px)' },
  spinner: { width:'44px', height:'44px', border:'3px solid rgba(102,126,234,0.2)', borderTop:'3px solid #667eea', borderRadius:'50%', margin:'0 auto 24px', animation:'spin 1s linear infinite' },
  title: { fontSize:'18px', fontWeight:'600', color:'white', marginBottom:'8px' },
  sub: { fontSize:'13px', color:'rgba(255,255,255,0.4)', marginBottom:'24px' },
  skillsList: { textAlign:'left', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'20px' },
  skillsTitle: { fontSize:'11px', color:'rgba(255,255,255,0.3)', fontWeight:'600', textTransform:'uppercase', marginBottom:'12px', letterSpacing:'0.1em' },
  skillItem: { display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' },
  skillName: { flex:1, fontSize:'13px', color:'white', fontWeight:'500' },
  skillBadge: { padding:'2px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:'500' },
  skillImportance: { fontSize:'11px', color:'rgba(255,255,255,0.3)' },
};
