import { useState } from "react";
import "./App.css";

// const API_URL = "http://localhost:8080/api/chat";
const API_URL = "/api/chat";

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

function App() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hello! Ask me about the Survivor Network.",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  async function sendMessage() {
    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: "frontend-chat",
        }),
      });

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="app">
      <div className="chat-container">
        <header className="header">
          <h1>Survivor Network AI</h1>
          <p>Graph RAG assistant powered by Spanner Graph</p>
        </header>

        <main className="messages">
          {messages.map((m, index) => (
            <div key={index} className={`message ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="bubble">Thinking...</div>
            </div>
          )}
        </main>

        <footer className="input-area">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask: Who treats Burns?"
            rows={2}
          />
          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;