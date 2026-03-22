import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function UniversalTest() {
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [currentSkillIdx, setCurrentSkillIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Starting assessment...');
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answered, setAnswered] = useState(0);
  const skillResults = useRef({});
  const navigate = useNavigate();

  const role = localStorage.getItem('selected_role');
  const name = localStorage.getItem('employee_name');
  const skills = JSON.parse(localStorage.getItem('required_skills') || '[]');
  const skillNames = skills.map(s => s.skill);

  useEffect(() => { beginSkill(0); }, []);

  const beginSkill = async (idx) => {
    if (idx >= skillNames.length) { await generateReport(); return; }
    setLoading(true);
    setStatus(`AI generating ${skillNames[idx]} questions...`);
    try {
      const res = await axios.post(`${API_URL}/universal/start-test/${encodeURIComponent(skillNames[idx])}`);
      setSessionId(res.data.session_id);
      setQuestion(res.data.question);
      setCurrentSkillIdx(idx);
      setAnswered(0);
      setSelected(null);
      setFeedback(null);
      setLoading(false);
    } catch (err) {
      setStatus('Error loading question.');
    }
  };

  const handleAnswer = async (option) => {
    if (selected) return;
    setSelected(option);
    try {
      const res = await axios.post(`${API_URL}/test/answer`, {
        session_id: sessionId,
        question_id: question.id,
        answer: option
      });
      setFeedback(res.data.feedback);
      setTimeout(async () => {
        setFeedback(null);
        if (res.data.status === 'completed') {
          skillResults.current[skillNames[currentSkillIdx]] = res.data.result.level;
          await beginSkill(currentSkillIdx + 1);
        } else {
          setQuestion(res.data.next_question);
          setAnswered(a => a + 1);
          setSelected(null);
        }
      }, 1500);
    } catch (err) {
      setSelected(null);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setStatus('AI generating your personalized report...');
    try {
      const res = await axios.post(`${API_URL}/universal/full-report`, {
        employee_name: name,
        role: role,
        assessed_skills: skillResults.current
      });
      const reportData = res.data;

      const saveRes = await axios.post(`${API_URL}/save-report`, reportData);
      const finalReport = { ...reportData, ai_explanation: saveRes.data.ai_explanation };
      localStorage.setItem('report', JSON.stringify(finalReport));
      navigate('/report');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  const progress = (currentSkillIdx / skillNames.length) * 100;

  if (loading) return (
    <div style={s.page}>
      <div style={s.orb1}/>
      <div style={s.loadWrap}>
        <div style={s.loadCard} className="fadeIn">
          <div style={s.spinner}/>
          <p style={s.loadTitle}>{status}</p>
          <p style={s.loadSub}>Skill {Math.min(currentSkillIdx+1, skillNames.length)} of {skillNames.length}</p>
          <div style={s.progressTrack}>
            <div style={{...s.progressFill, width:`${progress}%`}}/>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.orb1}/><div style={s.orb2}/>

      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoMark}><span style={s.logoLetters}>SG</span></div>
            <span style={s.logoText}>SkillGap<span style={{color:'#667eea'}}>.</span></span>
          </div>
          <div style={s.navMeta}>
            <span style={s.navName}>{name}</span>
            <span style={{color:'rgba(255,255,255,0.3)'}}>·</span>
            <span style={{fontSize:'13px', color:'#667eea'}}>{role}</span>
          </div>
        </div>
      </nav>

      <div style={s.wrap}>
        <div style={s.sidebar}>
          <p style={s.sideLabel}>Skills Assessment</p>
          {skillNames.map((sk, i) => (
            <div key={sk} style={s.sideItem}>
              <div style={{
                ...s.sideCircle,
                background: i < currentSkillIdx ? 'linear-gradient(135deg,#667eea,#764ba2)' : i === currentSkillIdx ? 'rgba(102,126,234,0.15)' : 'rgba(255,255,255,0.05)',
                border: i === currentSkillIdx ? '1.5px solid #667eea' : '1.5px solid transparent',
                color: i < currentSkillIdx ? 'white' : i === currentSkillIdx ? '#a5b4fc' : 'rgba(255,255,255,0.3)'
              }}>
                {i < currentSkillIdx ? '✓' : i+1}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px', fontWeight: i===currentSkillIdx?'600':'400', color: i===currentSkillIdx?'white':i<currentSkillIdx?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.3)'}}>{sk}</div>
                {i===currentSkillIdx && <div style={{fontSize:'10px', color:'#667eea', marginTop:'2px'}}>In progress...</div>}
                {i<currentSkillIdx && <div style={{fontSize:'10px', color:'#34d399', marginTop:'2px'}}>Done ✓</div>}
              </div>
            </div>
          ))}
          <div style={{marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
              <span style={{fontSize:'11px', color:'rgba(255,255,255,0.4)'}}>Progress</span>
              <span style={{fontSize:'11px', color:'#667eea'}}>{Math.round(progress)}%</span>
            </div>
            <div style={s.progressTrack}>
              <div style={{...s.progressFill, width:`${progress}%`}}/>
            </div>
          </div>
        </div>

        <div style={s.main}>
          <div style={s.card} className="fadeIn">
            <div style={s.cardHeader}>
              <div style={s.skillPill}>
                <span style={s.skillDot}/>
                {skillNames[currentSkillIdx]}
              </div>
              <div style={s.diffPill}>Difficulty {question?.difficulty}/5</div>
            </div>

            <h2 style={s.qText}>{question?.question}</h2>

            <div style={s.options}>
              {question && Object.entries(question.options).map(([key, val]) => (
                <button
                  key={key}
                  style={{
                    ...s.option,
                    background: selected===key ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.03)',
                    borderColor: selected===key ? '#667eea' : 'rgba(255,255,255,0.08)',
                    opacity: selected && selected!==key ? 0.5 : 1,
                  }}
                  onMouseOver={e => { if(!selected){ e.currentTarget.style.background='rgba(102,126,234,0.08)'; e.currentTarget.style.transform='translateX(4px)'; }}}
                  onMouseOut={e => { if(!selected){ e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.transform='translateX(0)'; }}}
                  onClick={() => handleAnswer(key)}
                >
                  <span style={{...s.optKey, background: selected===key?'#667eea':'rgba(255,255,255,0.08)', color: selected===key?'white':'rgba(255,255,255,0.5)'}}>{key}</span>
                  <span style={s.optVal}>{val}</span>
                </button>
              ))}
            </div>

            {feedback && (
              <div style={{padding:'14px 18px', borderRadius:'12px', background: feedback.correct?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)', border:`1px solid ${feedback.correct?'rgba(52,211,153,0.3)':'rgba(248,113,113,0.3)'}`, marginTop:'8px', animation:'fadeIn 0.3s ease'}}>
                <p style={{fontSize:'14px', fontWeight:'600', color: feedback.correct?'#34d399':'#f87171', marginBottom: feedback.explanation?'6px':'0'}}>
                  {feedback.correct ? '✓ Correct!' : `✗ Incorrect — Answer: ${feedback.correct_answer}`}
                </p>
                {feedback.explanation && <p style={{fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:'1.6', margin:0}}>{feedback.explanation}</p>}
              </div>
            )}

            <div style={s.cardFooter}>
              <span style={s.footNote}>Question {answered+1} of 5 · AI adaptive</span>
              <span style={s.footNote}>{selected ? 'Loading next...' : 'Select an answer'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#080818', position:'relative', overflow:'hidden', fontFamily:'Inter, sans-serif' },
  orb1: { position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)', top:'-200px', left:'-200px', pointerEvents:'none' },
  orb2: { position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom:'-100px', right:'-100px', pointerEvents:'none' },
  nav: { position:'relative', zIndex:10, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,24,0.9)', backdropFilter:'blur(20px)' },
  navInner: { maxWidth:'1200px', margin:'0 auto', padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { display:'flex', alignItems:'center', gap:'10px' },
  logoMark: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(102,126,234,0.15)', border:'1px solid rgba(102,126,234,0.3)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoLetters: { fontSize:'13px', fontWeight:'800', background:'linear-gradient(135deg,#667eea,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  logoText: { fontSize:'20px', fontWeight:'700', color:'white', letterSpacing:'-0.5px' },
  navMeta: { display:'flex', alignItems:'center', gap:'8px' },
  navName: { fontSize:'13px', color:'rgba(255,255,255,0.7)', fontWeight:'500' },
  loadWrap: { display:'flex', alignItems:'center', justifyContent:'center', minHeight:'90vh' },
  loadCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'48px 40px', textAlign:'center', width:'380px' },
  spinner: { width:'44px', height:'44px', border:'3px solid rgba(102,126,234,0.2)', borderTop:'3px solid #667eea', borderRadius:'50%', margin:'0 auto 24px', animation:'spin 1s linear infinite' },
  loadTitle: { fontSize:'17px', fontWeight:'600', color:'white', marginBottom:'8px' },
  loadSub: { fontSize:'13px', color:'rgba(255,255,255,0.4)', marginBottom:'20px' },
  progressTrack: { background:'rgba(255,255,255,0.08)', borderRadius:'6px', height:'6px', overflow:'hidden' },
  progressFill: { height:'6px', background:'linear-gradient(90deg,#667eea,#a78bfa)', borderRadius:'6px', transition:'width 0.5s ease' },
  wrap: { position:'relative', zIndex:1, maxWidth:'1100px', margin:'40px auto', padding:'0 32px', display:'flex', gap:'28px' },
  sidebar: { width:'240px', flexShrink:0, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'24px', height:'fit-content' },
  sideLabel: { fontSize:'10px', fontWeight:'600', color:'rgba(255,255,255,0.3)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'20px' },
  sideItem: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' },
  sideCircle: { width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'600', flexShrink:0, transition:'all 0.3s' },
  main: { flex:1 },
  card: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'36px', backdropFilter:'blur(20px)' },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' },
  skillPill: { display:'flex', alignItems:'center', gap:'8px', background:'rgba(102,126,234,0.12)', border:'1px solid rgba(102,126,234,0.25)', color:'#a5b4fc', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:'500' },
  skillDot: { width:'6px', height:'6px', borderRadius:'50%', background:'#667eea', display:'inline-block' },
  diffPill: { fontSize:'12px', color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.05)', padding:'4px 12px', borderRadius:'12px' },
  qText: { fontSize:'22px', fontWeight:'600', color:'white', lineHeight:'1.5', marginBottom:'28px' },
  options: { display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' },
  option: { display:'flex', gap:'16px', alignItems:'center', padding:'16px 20px', border:'1px solid', borderRadius:'14px', cursor:'pointer', textAlign:'left', transition:'all 0.2s', fontFamily:'Inter, sans-serif' },
  optKey: { width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'600', flexShrink:0, transition:'all 0.2s' },
  optVal: { fontSize:'15px', color:'rgba(255,255,255,0.85)', lineHeight:'1.4' },
  cardFooter: { display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'16px', marginTop:'16px' },
  footNote: { fontSize:'12px', color:'rgba(255,255,255,0.25)' },
};
