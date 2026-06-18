import { useState } from 'react';
import { sendAIChat } from '../../api/ai';
import styles from './AIAssistantWidget.module.css';

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const reply = await sendAIChat(userMessage);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to AI Assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className={styles.fab} onClick={toggleOpen} title="AI Learning Assistant">
        ✨
      </button>

      {isOpen && (
        <div className={styles.window}>
          <div className={styles.header}>
            <h4>✨ AI Learning Assistant</h4>
            <button onClick={toggleOpen}>×</button>
          </div>
          
          <div className={styles.chatArea}>
            {messages.length === 0 && (
              <p className={styles.empty}>Hi! I'm your AI assistant. How can I help you today?</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className={styles.loading}>AI is typing...</div>}
          </div>

          <form onSubmit={handleSubmit} className={styles.inputArea}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ask anything..." 
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}