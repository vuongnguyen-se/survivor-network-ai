import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const API_URL = `${API_BASE_URL}/api/chat`;

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type ChatResponse = {
  answer?: string;
  gql_query?: string | null;
  nodes_to_highlight?: string[];
  edges_to_highlight?: string[];
  suggested_followups?: string[];
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    text: "Hello! Ask me about the Survivor Network.",
  },
];

const SAMPLE_PROMPTS = [
  "Who treats Burns?",
  "Who can help with Arm injury?",
  "List all survivors",
  "Who has First Aid skill?", 
  "Who can analyze specimens?",
];

function App() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [loading, setLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string>(
    () => `frontend-chat-${Date.now()}`
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  async function sendMessage(promptOverride?: string) {
    const targetMessage = (promptOverride ?? message).trim();

    if (!targetMessage || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: targetMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: targetMessage,
          conversation_id: conversationId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as ChatResponse;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer || "No response.",
        },
      ]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages(INITIAL_MESSAGES);
    setMessage("");
    setConversationId(`frontend-chat-${Date.now()}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="app">
      <div className="chat-container">
        <header className="header">
          <div>
            <h1>Survivor Network AI</h1>
            <p>Graph RAG assistant powered by Spanner Graph</p>
          </div>

          <button
            className="clear-button"
            onClick={clearChat}
            disabled={loading}
            type="button"
          >
            Clear chat
          </button>
        </header>

        <main className="messages">
          {messages.map((m, index) => (
            <div key={index} className={`message ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="bubble thinking">Thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        <section className="prompt-panel">
          <span className="prompt-label">Try asking:</span>

          <div className="prompt-list">
            {SAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className="prompt-chip"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        <footer className="input-area">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask: Who treats Burns?"
            rows={2}
            disabled={loading}
          />
          <button onClick={() => sendMessage()} disabled={loading} type="button">
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;