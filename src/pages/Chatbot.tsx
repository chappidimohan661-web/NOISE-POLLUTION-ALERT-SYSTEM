import { useState, useRef, useEffect } from 'react'
import { Send, Brain, Sparkles } from 'lucide-react'
import { useClassData } from '../lib/useClassData'
import { analyzeAll, classSummary, answerQuery } from '../lib/analysis'
import { useAuth } from '../lib/auth'

interface Message {
  role: 'user' | 'ai'
  text: string
}

const SUGGESTIONS = [
  'Which students are at risk?',
  'What is the class average attendance?',
  'Who is the topper?',
  'How can students improve?',
  'Give me a class summary',
]

export default function Chatbot() {
  const { students, attendance, marks, loading } = useClassData()
  const { profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: `Hello ${profile?.full_name?.split(' ')[0] ?? 'there'}! I'm your AI assistant. Ask me about student attendance, marks, performance predictions, risk levels, or recommendations. You can also ask about a specific student by name.`,
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const analytics = analyzeAll(students, attendance, marks)
  const summary = classSummary(analytics)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const send = (text: string) => {
    if (!text.trim() || thinking) return
    const userMsg: Message = { role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setThinking(true)
    // simulate brief thinking delay for UX
    setTimeout(() => {
      const answer = loading
        ? 'Still loading your class data — please wait a moment and try again.'
        : answerQuery(text, analytics, summary)
      setMessages((m) => [...m, { role: 'ai', text: answer }])
      setThinking(false)
    }, 450)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px - 56px)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>AI Assistant</h1>
          <p>Ask questions in plain English — I analyze attendance, marks, and risk</p>
        </div>
        <div className="badge badge-primary"><Sparkles size={12} /> AI-Powered Insights</div>
      </div>

      <div className="chat-suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            <div className={`chat-avatar ${m.role === 'ai' ? 'ai' : 'user'}`}>
              {m.role === 'ai' ? <Brain size={18} /> : (profile?.full_name?.[0]?.toUpperCase() ?? 'U')}
            </div>
            <div className="chat-bubble">{m.text}</div>
          </div>
        ))}
        {thinking && (
          <div className="chat-message">
            <div className="chat-avatar ai"><Brain size={18} /></div>
            <div className="chat-bubble" style={{ color: 'var(--text-muted)' }}>Analyzing your class data…</div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <input
            className="form-control"
            placeholder="Ask about attendance, marks, predictions, or a student…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
          />
          <button className="btn btn-primary" onClick={() => send(input)} disabled={!input.trim() || thinking}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
