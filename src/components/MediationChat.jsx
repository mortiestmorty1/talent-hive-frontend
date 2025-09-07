import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { GET_DISPUTE_ROUTE, POST_DISPUTE_MESSAGE_ROUTE } from "../utils/constants";
import { toast } from "react-toastify";

function MediationChat({ disputeId }) {
  const [cookies] = useCookies();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await axios.get(`${GET_DISPUTE_ROUTE}/${disputeId}`, {
          headers: { Authorization: `Bearer ${cookies.jwt}` },
        });
        setMessages(data.messages || []);
      } catch (e) {
        // ignore
      }
    };
    if (disputeId && cookies.jwt) run();
  }, [disputeId, cookies]);

  const send = async () => {
    if (!text.trim()) return;
    
    try {
      const { data } = await axios.post(`${POST_DISPUTE_MESSAGE_ROUTE}/${disputeId}`, { text }, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      
      // Add the new message with sender info directly
      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to send message");
    }
  };

  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-[#404145] mb-4">Mediation Chat</h4>
      <div className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-auto flex flex-col gap-3 bg-white">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className="text-sm bg-gray-100 rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-xs text-blue-600">
                  {m.sender ? (
                    <span>
                      {m.sender.fullName || m.sender.username} 
                      <span className="text-gray-500 ml-1">({m.sender.email})</span>
                    </span>
                  ) : (
                    'Unknown Sender'
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-gray-700">{m.text}</div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm">No messages yet</div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input 
          className="flex-1 p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Type a message" 
          onKeyPress={(e) => e.key === 'Enter' && send()}
        />
        <button className="border text-sm font-semibold px-6 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-lg hover:bg-[#18a65c] transition-colors" type="button" onClick={send}>Send</button>
      </div>
    </div>
  );
}

export default MediationChat;


