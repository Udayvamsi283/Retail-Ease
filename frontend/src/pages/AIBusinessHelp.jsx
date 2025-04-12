import { useEffect, useRef } from "react"; import CryptoJS from "crypto-js"; import "../styles/AIBusinessHelp.css";

const AIBusinessHelp = ({ currentUser }) => { const botContainerRef = useRef(null);

useEffect(() => { const userId = currentUser?.uid || "guest_user"; 
const secret = "dbjin8z9tdvktq2dkm661iecb1uxkcjn"; // 🔐 Replace with your actual Chatbase secret 
const hash = CryptoJS.HmacSHA256(userId, secret).toString();

// Remove existing Chatbase iframe if any
const existingFrame = document.getElementById("chatbase-frame");
if (existingFrame) existingFrame.remove();

// Create Chatbase iframe for full screen experience
const iframe = document.createElement("iframe");
iframe.src = `https://www.chatbase.co/chatbot-iframe/YqM2rVJeK1WB1LyvIDGy7?userId=${userId}&signature=${hash}`;
iframe.width = "100%";
iframe.height = "100%";
iframe.style.border = "none";
iframe.id = "chatbase-frame";

if (botContainerRef.current) {
  botContainerRef.current.innerHTML = ""; // Clear any old content
  botContainerRef.current.appendChild(iframe);
}
}, [currentUser]);

return ( <div className="ai-chat-fullscreen"> <h1 className="page-title">AI Business Assistant </h1> <div ref={botContainerRef} className="chatbot-container" /> </div> ); };

export default AIBusinessHelp;