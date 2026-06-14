import { useState, useRef, useEffect } from 'react'
import {
  Zap, Send, Bot, User, Loader, RotateCcw, Download,
  BookOpen, Calculator, ChevronRight, Lightbulb, Eye, EyeOff,
  Cpu, Radio, Battery, Waves, Settings, Copy, Check, Hash
} from 'lucide-react'
import styles from './App.module.css'

const TOPICS = [
  { id: 'dc', label: 'DC Circuits', icon: Battery, color: '#ffd700' },
  { id: 'ac', label: 'AC Circuits', icon: Waves, color: '#00d4ff' },
  { id: 'op-amp', label: 'Op-Amps', icon: Cpu, color: '#00ff88' },
  { id: 'digital', label: 'Digital Logic', icon: Radio, color: '#ff6b81' },
  { id: 'filters', label: 'Filters & Freq', icon: Settings, color: '#a78bfa' },
  { id: 'power', label: 'Power Electronics', icon: Zap, color: '#fb923c' },
]

const QUICK_QUESTIONS = [
  "Explain Kirchhoff's Voltage Law with a worked example",
  "How does a non-inverting op-amp work? Give gain formula.",
  "Design a low-pass RC filter for cutoff at 1kHz",
  "What is impedance matching and why does it matter?",
  "Explain the difference between BJT and MOSFET",
  "How to calculate power dissipation in a resistor?",
  "What is Thevenin's theorem? Show me a step-by-step example.",
  "Explain how a 555 timer works in astable mode",
]

const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced']

function TopicChip({ topic, active, onClick }) {
  const Icon = topic.icon
  return (
    <button
      className={`${styles.topicChip} ${active ? styles.topicChipActive : ''}`}
      style={active ? { borderColor: topic.color, color: topic.color, background: topic.color + '18' } : {}}
      onClick={onClick}
    >
      <Icon size={13} />
      {topic.label}
    </button>
  )
}

function MessageBlock({ msg }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`${styles.msgWrap} ${isUser ? styles.msgWrapUser : ''}`}>
      <div className={styles.msgAvatar}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={styles.msgBody}>
        {!isUser && msg.topic && (
          <div className={styles.msgTag}>
            <Hash size={10} /> {msg.topic}
            {msg.difficulty && <span className={styles.diffBadge}>{msg.difficulty}</span>}
          </div>
        )}
        <div
          className={`${styles.msgBubble} ${isUser ? styles.bubbleUser : styles.bubbleBot}`}
          dangerouslySetInnerHTML={{ __html: renderMsg(msg.content) }}
        />
        {!isUser && (
          <button className={styles.copyMsg} onClick={copy}>
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

function renderMsg(text) {
  return text
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="codeblock">${escHtml(code.trim())}</pre>`)
    .replace(/`([^`]+)`/g, `<code class="inline-code">$1</code>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4 class="rh4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="rh3">$1</h3>')
    .replace(/^- (.+)$/gm, '<div class="rbullet">• $1</div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div class="rnum"><span>$1.</span> $2</div>')
    .replace(/\n{2,}/g, '</p><p class="rpara">')
    .replace(/\n/g, '<br/>')
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('cm_key') || '')
  const [showKey, setShowKey] = useState(false)
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Welcome to **CircuitMind** — your AI circuit design tutor.\n\nI can help you with:\n- **Theory explanations** with worked examples\n- **Step-by-step calculations** (KVL, KCL, Thevenin, Norton, etc.)\n- **Design problems** — op-amps, filters, power circuits\n- **Debugging** circuit issues\n- **Concept comparisons** — BJT vs MOSFET, AC vs DC analysis\n\nSelect a topic and difficulty level, then ask me anything or pick a quick question below.`,
  }])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTopic, setActiveTopic] = useState(null)
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [showQuick, setShowQuick] = useState(true)
  const chatRef = useRef(null)

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const saveKey = k => { setApiKey(k); localStorage.setItem('cm_key', k) }

  const send = async (text) => {
    if (!text.trim()) return
    if (!apiKey) {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ Please enter your **Claude API key** above to start.' }])
      return
    }

    const topic = activeTopic ? TOPICS.find(t => t.id === activeTopic)?.label : 'General Circuits'
    const userMsg = { role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setShowQuick(false)

    const newHistory = [...history, { role: 'user', content: text }]
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: `You are CircuitMind, an expert electronics and circuit design tutor for engineering students.

Topic focus: ${topic}
Student level: ${difficulty}

Your teaching style:
- Always explain the underlying theory first, then apply it
- Show ALL steps in calculations — never skip steps
- Use standard notation: V for voltage, I for current, R for resistance, Z for impedance
- Format equations clearly, e.g.: V = IR, Z = √(R² + X²)
- For ${difficulty} level: ${difficulty === 'Beginner' ? 'use simple language, avoid jargon, relate to everyday examples' : difficulty === 'Intermediate' ? 'assume basic knowledge, introduce proper terminology, show derivations' : 'use full technical depth, discuss non-ideal behavior, real-world tradeoffs'}
- When giving circuit designs, describe component values precisely
- Use code blocks for circuit netlists or pseudocode
- End explanations with a "Key Takeaway" and a follow-up question to test understanding

Format your responses using clear sections with ## headers.`,
          messages: newHistory,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const reply = data.content[0].text
      setHistory([...newHistory, { role: 'assistant', content: reply }])
      setMessages(m => [...m, { role: 'assistant', content: reply, topic, difficulty }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `❌ **Error:** ${err.message}` }])
    }
    setLoading(false)
  }

  const clear = () => {
    setMessages([{ role: 'assistant', content: 'Session cleared. Ready for a new topic!' }])
    setHistory([])
    setShowQuick(true)
  }

  const exportChat = () => {
    const text = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n')
    const blob = new Blob([`CircuitMind AI Tutor Session\nExported: ${new Date().toLocaleString()}\n\n` + text], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `circuitmind-session-${Date.now()}.txt`; a.click()
  }

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}><Zap size={18} /></div>
          <span className={styles.logoText}>Circuit<strong>Mind</strong></span>
          <span className={styles.logoDivider}>/</span>
          <span className={styles.logoSub}>AI Circuit Tutor</span>
        </div>
        <div className={styles.keyArea}>
          <span className={styles.keyLabel}>API KEY</span>
          <input
            type={showKey ? 'text' : 'password'}
            className={styles.keyInput}
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={e => saveKey(e.target.value)}
          />
          <button className={styles.eyeBtn} onClick={() => setShowKey(v => !v)}>
            {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sideBlock}>
            <p className={styles.sideLabel}>TOPIC</p>
            <div className={styles.topicGrid}>
              {TOPICS.map(t => (
                <TopicChip key={t.id} topic={t}
                  active={activeTopic === t.id}
                  onClick={() => setActiveTopic(activeTopic === t.id ? null : t.id)} />
              ))}
            </div>
          </div>

          <div className={styles.sideBlock}>
            <p className={styles.sideLabel}>DIFFICULTY</p>
            <div className={styles.diffRow}>
              {DIFFICULTY.map(d => (
                <button key={d}
                  className={`${styles.diffBtn} ${difficulty === d ? styles.diffBtnActive : ''}`}
                  onClick={() => setDifficulty(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sideBlock}>
            <p className={styles.sideLabel}>QUICK QUESTIONS</p>
            <div className={styles.quickList}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} className={styles.quickBtn} onClick={() => send(q)}>
                  <ChevronRight size={11} />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sideActions}>
            <button className={styles.actionBtn} onClick={clear}><RotateCcw size={13} /> New Session</button>
            <button className={styles.actionBtn} onClick={exportChat}><Download size={13} /> Export</button>
          </div>
        </aside>

        {/* Chat */}
        <main className={styles.chatArea}>
          <div className={styles.chatScroll} ref={chatRef}>
            <div className={styles.chatInner}>
              {messages.map((m, i) => <MessageBlock key={i} msg={m} />)}
              {loading && (
                <div className={styles.thinkingRow}>
                  <div className={styles.msgAvatar} style={{ color: 'var(--cyan)' }}><Bot size={14} /></div>
                  <div className={styles.thinking}>
                    <span /><span /><span />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.inputArea}>
            {showQuick && messages.length <= 1 && (
              <div className={styles.promptHint}>
                <Lightbulb size={13} style={{ color: 'var(--yellow)' }} />
                <span>Ask a circuit question, or pick one from the sidebar</span>
              </div>
            )}
            <div className={styles.inputRow}>
              <textarea
                className={styles.inputBox}
                placeholder="Ask anything about circuits — theory, calculations, design problems..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
                }}
                rows={2}
                disabled={loading}
              />
              <button className={styles.sendBtn} onClick={() => send(input)} disabled={loading || !input.trim()}>
                {loading ? <Loader size={18} className={styles.spin} /> : <Send size={18} />}
              </button>
            </div>
            <p className={styles.inputHint}>Press Enter to send · Shift+Enter for new line</p>
          </div>
        </main>
      </div>

      <style>{`
        .codeblock { background:#0a1628; border:1px solid var(--border2); border-left:3px solid var(--cyan); border-radius:6px; padding:14px; margin:12px 0; font-family:var(--font-mono); font-size:0.78rem; line-height:1.7; color:#8ab4f8; overflow-x:auto; white-space:pre; }
        .inline-code { background:#0f1e35; border:1px solid var(--border2); border-radius:3px; padding:1px 6px; font-family:var(--font-mono); font-size:0.82em; color:var(--cyan); }
        .rh3 { font-family:var(--font-display); font-size:1.05rem; font-weight:700; color:var(--cyan); margin:16px 0 8px; letter-spacing:0.5px; text-transform:uppercase; }
        .rh4 { font-family:var(--font-display); font-size:0.9rem; font-weight:600; color:var(--yellow); margin:12px 0 6px; letter-spacing:0.3px; }
        .rbullet { padding:3px 0 3px 14px; line-height:1.6; }
        .rnum { display:flex; gap:8px; padding:3px 0; line-height:1.6; }
        .rnum span { color:var(--cyan); font-family:var(--font-mono); font-size:0.85em; flex-shrink:0; }
        .rpara { margin-top:10px; }
      `}</style>
    </div>
  )
}
