import React, { useState } from "react";
import axios from "axios";
import Message from "./Message";
import InputBox from "./InputBox";
import "./ChatWindow.css";

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! Welcome to Vignan Helpdesk" }
  ]);

  const sendMessage = async (text) => {
    const userMessage = { sender: "user", text };
    setMessages([...messages, userMessage]);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        question: text,
      });
      const botReply = res.data.reply; // Ensure backend sends { reply: "text" }

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to server." }
      ]);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, idx) => (
          <Message key={idx} sender={msg.sender} text={msg.text} />
        ))}
      </div>
      <InputBox onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;
