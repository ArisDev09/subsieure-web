// js/chatbot.js - Code gốc, sau đó copy vào obfuscator.io để mã hóa

(function() {
    const GROQ_API_KEY = "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";
    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    
    let conversationHistory = [];
    let isLoading = false;
    let typingIndicator = null;

    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function formatMessage(text) {
        let formatted = escapeHtml(text);
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return formatted;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessage(role, content) {
        const div = document.createElement('div');
        div.className = 'message ' + role;
        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        if (role === 'bot') {
            div.innerHTML = '<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content">' + formatMessage(content) + '<br><span class="message-time">' + time + '</span></div>';
        } else {
            div.innerHTML = '<div class="message-avatar"><i class="fas fa-user"></i></div><div class="message-content">' + escapeHtml(content) + '<br><span class="message-time">' + time + '</span></div>';
        }
        
        chatMessages.appendChild(div);
        scrollToBottom();
    }

    function showTyping() {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = '<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="typing-indicator"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(typingIndicator);
        scrollToBottom();
    }

    function hideTyping() {
        if (typingIndicator && typingIndicator.remove) {
            typingIndicator.remove();
        }
    }

    conversationHistory = [{
        role: "system",
        content: "Bạn là trợ lý AI của Subsieure, một cửa hàng bán tool auto, tool SEO, tool marketing. Hãy trả lời lịch sự, thân thiện và hữu ích. Giới thiệu về Subsieure: cửa hàng cung cấp các tool chất lượng cao với giá tốt nhất, bảo hành trọn đời, hỗ trợ 24/7. Các tool có sẵn: SEO, Facebook, Game, Auto. Khách hàng có thể liên hệ Zalo 0986.947.309 để được tư vấn và nạp tiền."
    }];

    async function sendToGroq(message) {
        try {
            conversationHistory.push({ role: "user", content: message });
            
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + GROQ_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: conversationHistory,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });
            
            if (!response.ok) throw new Error("API error");
            
            const data = await response.json();
            const reply = data.choices[0].message.content;
            
            conversationHistory.push({ role: "assistant", content: reply });
            
            if (conversationHistory.length > 21) {
                conversationHistory = [conversationHistory[0], ...conversationHistory.slice(-20)];
            }
            
            return reply;
        } catch (error) {
            console.error(error);
            return "Xin lỗi, hiện tại tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ Admin qua Zalo 0986.947.309.";
        }
    }

    async function sendMessage() {
        if (isLoading) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        chatInput.value = '';
        chatInput.style.height = 'auto';
        addMessage('user', message);
        
        isLoading = true;
        sendBtn.disabled = true;
        showTyping();
        
        try {
            const reply = await sendToGroq(message);
            hideTyping();
            addMessage('bot', reply);
        } catch (error) {
            hideTyping();
            addMessage('bot', 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    function sendSuggestion(text) {
        chatInput.value = text;
        sendMessage();
    }

    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    
    document.querySelectorAll('.suggestion-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            sendSuggestion(chip.dataset.suggestion);
        });
    });

    const cursorGlow = document.getElementById('cursorGlow');
    document.addEventListener('mousemove', function(e) {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    auth.onAuthStateChanged(function(user) {
        if (user && user.email === 'nguyenvinhhoang209@gmail.com') {
            document.getElementById('adminLink').style.display = 'inline-block';
        }
        chatInput.focus();
    });
})();