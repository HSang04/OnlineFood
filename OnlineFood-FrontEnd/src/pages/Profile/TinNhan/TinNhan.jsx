import React, { useEffect, useState, useRef } from "react";
import axios from "../../../services/axiosInstance";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import "./TinNhan.css";

const TinNhan = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); 
  const idNguoiDung = localStorage.getItem("idNguoiDung");
  const jwt = localStorage.getItem("jwt");


  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const isCustomer = (role) => {
    return role === 'KHACHHANG';
  };


  const isStaff = (role) => {
    return !isCustomer(role);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!idNguoiDung || !jwt) return;

      try {
        const response = await axios.get(`/nguoi-dung/secure/${idNguoiDung}`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        
        setUser(response.data);
        
   
        if (isCustomer(response.data.vaiTro)) {
          loadCustomerChat();
        } else if (isStaff(response.data.vaiTro)) {
      
          loadAllConversations();
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserData();
  }, [idNguoiDung, jwt]);

  
  const loadCustomerChat = async () => {
    try {
      const response = await axios.get('/tin-nhan/chat', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      setCurrentConversation(response.data.hoiThoai);
      setMessages(response.data.tinNhanList || []);
      
      return response.data.hoiThoai;
    } catch (error) {
      console.error("Lỗi khi tải chat:", error);
      return null;
    }
  };

  const loadAllConversations = async () => {
    try {
      const response = await axios.get('/tin-nhan/hoi-thoai/all', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      setConversations(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách hội thoại:", error);
    }
  };


  const loadChatWithCustomer = async (customerId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/tin-nhan/chat/${customerId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      setCurrentConversation(response.data.hoiThoai);
      setMessages(response.data.tinNhanList || []);
      setSelectedCustomerId(customerId);
    } catch (error) {
      console.error("Lỗi khi tải chat với khách hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const connectWebSocket = () => {
    if (stompClient && stompClient.connected) {
      return;
    }

    setConnecting(true);
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    
    client.connect({}, () => {
      console.log('WebSocket kết nối thành công');
      setStompClient(client);
      setConnecting(false);
      
      
      client.subscribe('/topic/public', (message) => {
        const receivedMessage = JSON.parse(message.body);
        
       
        if (currentConversation && 
            receivedMessage.hoiThoai.id === currentConversation.id &&
            receivedMessage.nguoiGuiId.toString() !== idNguoiDung) {
          setMessages(prev => [...prev, receivedMessage]);
        }
      });
    }, (error) => {
      console.error('WebSocket connection error:', error);
      setConnecting(false);
    });
  };


  const disconnectWebSocket = () => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }
    setStompClient(null);
  };

  useEffect(() => {
    if (currentConversation) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [currentConversation?.id]); 


  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim(); 
    setNewMessage(""); 

    try {
      let conversationToUse = currentConversation;
      
      
      if (isCustomer(user.vaiTro) && !conversationToUse) {
        conversationToUse = await loadCustomerChat();
        if (!conversationToUse) {
          throw new Error("Không thể tạo hoặc tải hội thoại");
        }
        setCurrentConversation(conversationToUse); 
      }
    
      if (conversationToUse) {
        await sendActualMessage(conversationToUse, messageContent);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setNewMessage(messageContent);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    } finally {
      setSending(false);
    }
  };


  const sendActualMessage = async (conversation, messageContent) => {
    const messageData = {
      hoiThoaiId: conversation.id,
      noiDung: messageContent
    };

    try {
    
      const response = await axios.post('/tin-nhan/gui', messageData, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

    
      setMessages(prev => [...prev, response.data]);

    
      if (stompClient && stompClient.connected) {
        stompClient.send('/app/sendMessage', {}, JSON.stringify(response.data));
      }

    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn thực tế:", error);
      throw error; 
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const getRoleName = (role) => {
    if (isCustomer(role)) {
      return 'Khách hàng';
    } else {
      return 'Nhân viên';
    }
  };

  if (!user) {
    return <div className="chat-loading">Đang tải...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>
          {isCustomer(user.vaiTro) 
            ? 'Hỗ trợ khách hàng' 
            : 'Quản lý hội thoại khách hàng'}
        </h2>
        <div className="connection-status">
          {connecting && <span className="connecting">Đang kết nối...</span>}
          {stompClient && stompClient.connected && <span className="connected">Đã kết nối</span>}
          {sending && <span className="sending">Đang gửi...</span>}
        </div>
      </div>

      <div className="chat-content">

        {isStaff(user.vaiTro) && (
          <div className="chat-sidebar">
            <h3>Danh sách hội thoại</h3>
            <div className="conversations-list">
              {conversations.length === 0 ? (
                <p className="no-conversations">Chưa có hội thoại nào</p>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      selectedCustomerId === conversation.khachHang.id ? 'active' : ''
                    }`}
                    onClick={() => loadChatWithCustomer(conversation.khachHang.id)}
                  >
                    <div className="customer-info">
                      <div className="customer-name">
                        {conversation.khachHang.hoTen || conversation.khachHang.username}
                      </div>
                      <div className="customer-email">
                        {conversation.khachHang.email}
                      </div>
                      <div className="conversation-time">
                        {formatTime(conversation.thoiGianTao)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}


        <div className="chat-main">
          {currentConversation || isCustomer(user.vaiTro) ? (
            <>
     
              <div className="chat-conversation-header">
                {isCustomer(user.vaiTro) ? (
                  <div>
                    <h4>Hỗ trợ khách hàng</h4>
                    <span>Gửi tin nhắn để được hỗ trợ</span>
                  </div>
                ) : (
                  <div>
                    <h4>
                      Chat với: {currentConversation?.khachHang?.hoTen || 
                                 currentConversation?.khachHang?.username}
                    </h4>
                    <span>{currentConversation?.khachHang?.email}</span>
                  </div>
                )}
              </div>

     
              <div className="messages-container" ref={messagesContainerRef}>
                {loading ? (
                  <div className="messages-loading">Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    {isCustomer(user.vaiTro) ? (
                      <>
                        <div className="welcome-message-inline">
                          <h3>Chào mừng bạn đến với hỗ trợ khách hàng!</h3>
                          <p>Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện với đội ngũ hỗ trợ.</p>
                        </div>
                      </>
                    ) : (
                      "Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!"
                    )}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${
                        message.nguoiGuiId.toString() === idNguoiDung ? 'own-message' : 'other-message'
                      }`}
                    >
                      <div className="message-info">
                        <span className="sender-role">
                          {getRoleName(message.vaiTroNguoiGui)}
                        </span>
                        <span className="message-time">
                          {formatTime(message.thoiGianTao)}
                        </span>
                      </div>
                      <div className="message-content">
                        {message.noiDung}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

            
              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isCustomer(user.vaiTro) ? "Nhập tin nhắn để bắt đầu trò chuyện..." : "Nhập tin nhắn..."}
                    className="message-input"
                    rows="3"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || connecting || sending}
                    className="send-button"
                  >
                    {sending ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <div className="select-conversation">
                <h3>Chọn một hội thoại để bắt đầu</h3>
                <p>Chọn khách hàng từ danh sách bên trái để xem và trả lời tin nhắn.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TinNhan;