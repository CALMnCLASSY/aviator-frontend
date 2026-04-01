/**
 * AviSignals Custom AI Support Chat
 * Injects a stylish Gold & Dark UI with a money green touch.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        /* Chat Toggle Button */
        #ai-chat-toggle {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 65px;
            height: 65px;
            background: linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 25px rgba(241, 196, 15, 0.4);
            cursor: pointer;
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 3px solid rgba(255, 255, 255, 0.2);
            animation: ai-bounce 3s infinite ease-in-out;
        }
        #ai-chat-toggle:hover {
            transform: scale(1.1) translateY(-5px);
            animation-play-state: paused;
        }
        #ai-chat-toggle i {
            font-size: 30px;
            color: #10152b;
        }
        
        /* Chat Toggle Label (Speech Bubble) */
        .ai-chat-label {
            position: fixed;
            bottom: 35px;
            right: 105px;
            background: #fff;
            color: #10152b;
            padding: 10px 18px;
            border-radius: 20px;
            border-bottom-right-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 9998;
            opacity: 1;
            transition: opacity 0.3s;
            animation: ai-label-fade 5s infinite;
        }
        .ai-chat-label::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: -8px;
            width: 15px;
            height: 15px;
            background: #fff;
            clip-path: polygon(0 0, 0% 100%, 100% 100%);
        }

        .money-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #2ecc71;
            color: white;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #10152b;
            font-weight: bold;
        }

        /* Chat Window */
        #ai-chat-window {
            position: fixed;
            bottom: 105px;
            right: 25px;
            width: 380px;
            height: 550px;
            background: rgba(16, 21, 43, 0.9);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(241, 196, 15, 0.4);
            border-radius: 20px;
            display: none;
            flex-direction: column;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
            z-index: 9999;
            overflow: hidden;
            font-family: 'Outfit', 'Inter', 'Segoe UI', Arial, sans-serif;
            transition: all 0.3s ease;
        }
        #ai-chat-window.active {
            display: flex;
            animation: chatSlideUp 0.3s ease-out;
        }

        /* Chat Header */
        .ai-chat-header {
            background: linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%);
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #10152b;
        }
        .ai-chat-title {
            font-weight: bold;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .ai-chat-subtitle {
            font-size: 12px;
            opacity: 0.8;
        }
        .ai-chat-close {
            background: none;
            border: none;
            font-size: 20px;
            color: #10152b;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .ai-chat-close:hover {
            opacity: 1;
        }

        /* Chat Body */
        .ai-chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #0b0d17;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .msg-bubble {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 14px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
        }
        .msg-ai {
            background: #1a2245;
            color: #fff;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            border: 1px solid rgba(241, 196, 15, 0.1);
        }
        .msg-user {
            background: #2ecc71; /* Money green touch */
            color: #10152b;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            font-weight: 500;
        }

        /* Chat Input */
        .ai-chat-input-area {
            padding: 12px;
            background: #10152b;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 8px;
        }
        #ai-chat-input {
            flex: 1;
            padding: 10px 14px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: #0b0d17;
            color: #fff;
            outline: none;
            font-size: 14px;
            font-family: inherit;
        }
        #ai-chat-input:focus {
            border-color: #f1c40f;
        }
        #ai-chat-send {
            background: #f1c40f;
            color: #10152b;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        #ai-chat-send:hover {
            background: #d4ac0d;
        }

        /* Loading Indicator */
        .ai-typing {
            display: flex;
            gap: 4px;
            padding: 10px 14px;
            background: #1a2245;
            border-radius: 14px;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            align-items: center;
        }
        .ai-typing span {
            width: 6px;
            height: 6px;
            background: #f1c40f;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out both;
        }
        .ai-typing span:nth-child(1) { animation-delay: -0.32s; }
        .ai-typing span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes chatSlideUp {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        @keyframes ai-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        @keyframes ai-label-fade {
            0%, 100% { opacity: 0.9; transform: translateX(0); }
            50% { opacity: 1; transform: translateX(-5px); }
        }
        
        /* Markdown support for AI links */
        .msg-ai a {
            color: #f1c40f;
            text-decoration: underline;
            font-weight: 600;
        }
        .msg-ai strong {
            color: #f1c40f;
            font-weight: 700;
        }
        .ai-chat-messages ul {
            margin: 5px 0;
            padding-left: 20px;
        }
        .ai-chat-messages li {
            margin-bottom: 4px;
        }
    `;
    document.head.appendChild(style);

    // Inject HTML Layer
    const chatHTML = `
        <div id="ai-chat-window">
            <div class="ai-chat-header">
                <div>
                    <div class="ai-chat-title"><i class="fas fa-robot"></i> AviSignals Support</div>
                    <div class="ai-chat-subtitle">Online • Fast Responses</div>
                </div>
                <button class="ai-chat-close" onclick="document.getElementById('ai-chat-window').classList.remove('active'); document.querySelector('.ai-chat-label').style.display='block'">&times;</button>
            </div>
            <div class="ai-chat-messages" id="ai-messages">
                <!-- Welcome Message -->
            </div>
            <div class="ai-chat-input-area">
                <input type="text" id="ai-chat-input" placeholder="Ask about predictions..." onkeypress="if(event.key === 'Enter') sendAIChatMessage()">
                <button id="ai-chat-send" onclick="sendAIChatMessage()"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>

        <div class="ai-chat-label">Hello, need predictions, I'm here to help</div>
        <div id="ai-chat-toggle" onclick="document.getElementById('ai-chat-window').classList.toggle('active'); document.querySelector('.ai-chat-label').style.display='none'">
            <i class="fas fa-comment-dots"></i>
            <div class="money-badge"><i class="fas fa-dollar-sign"></i></div>
        </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = chatHTML;
    document.body.appendChild(wrapper);

    // Initial Welcome Message
    setTimeout(() => {
        addMessage('ai', "Hello! I am the AviSignals assistant. 👋 Need help with predictions, ask me anything?");
    }, 1000);
});

// Replace backend URL if needed
const AI_BACKEND_URL = "https://back.avisignals.com/api/ai/chat";
let chatHistory = [];

function generateSessionId() {
    let sid = localStorage.getItem('ai_chat_session');
    if (!sid) {
        sid = 'chat_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ai_chat_session', sid);
    }
    return sid;
}

function getUserSessionStatus() {
    const sessionKey = 'avisignals_session_state_v1';
    const activationKey = 'avisignals_daily_activation_v1';
    const contactKey = 'aviator_contact';

    let status = {
        isLoggedIn: false,
        hasActiveSession: false,
        assignedSite: 'none',
        hasDailyCode: false,
        dailyCode: '',
        isCodeUsed: false,
        activationType: 'none'
    };

    try {
        // 1. Check Login / Identity
        const contact = localStorage.getItem(contactKey);
        if (contact && contact !== 'Unknown User') {
            status.isLoggedIn = true;
        }

        // 2. Check Active Bot Session (The timer/modal)
        const sessionRaw = localStorage.getItem(sessionKey);
        if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            if (session && session.expiry > Date.now()) {
                status.hasActiveSession = true;
                status.activationType = session.reason || 'active';
            }
        }

        // 3. Check Daily Activation (Trial/Premium)
        const activationRaw = localStorage.getItem(activationKey);
        if (activationRaw) {
            const activation = JSON.parse(activationRaw);

            // Match bot.html local date key logic
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            // We only care if it's for today
            if (activation && activation.lastActivatedDate === today) {
                status.assignedSite = activation.site || 'none';
                status.hasDailyCode = !!activation.code;
                status.dailyCode = activation.code || '';
                status.isCodeUsed = !!activation.codeUsed;
                if (!status.activationType || status.activationType === 'none') {
                    status.activationType = activation.activationType || 'none';
                }
            }
        }

        // 4. Fallback site if not activated yet but selected
        if (status.assignedSite === 'none') {
            status.assignedSite = localStorage.getItem('selectedSite') || 'none';
        }

    } catch (e) {
        console.warn("AI Chat: Error reading session status", e);
    }

    return status;
}

function addMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg-bubble msg-${sender}`;

    // Formatting Logic
    let formattedText = text
        // Convert Markdown Links: [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Convert Bold: **text**
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Convert Plain URLs to Clickable Links (only if not already inside an <a> tag)
        .replace(/(?<!")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
        // Convert Bullet Points: - Item or * Item
        .replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>');

    // Wrap groups of <li> in <ul>
    if (formattedText.includes('<li>')) {
        formattedText = formattedText.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
    }

    // Convert new lines to <br> (handle carefully with <ul>)
    formattedText = formattedText.replace(/\n/g, '<br>').replace(/<\/ul><br>/g, '</ul>');

    msgDiv.innerHTML = formattedText;

    document.getElementById('ai-messages').appendChild(msgDiv);
    msgDiv.scrollIntoView({ behavior: 'smooth' });
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-typing';
    typingDiv.id = 'ai-typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    document.getElementById('ai-messages').appendChild(typingDiv);
    typingDiv.scrollIntoView({ behavior: 'smooth' });
}

function hideTypingIndicator() {
    const ind = document.getElementById('ai-typing-indicator');
    if (ind) ind.remove();
}

async function sendAIChatMessage() {
    const input = document.getElementById('ai-chat-input');
    const text = input.value.trim();
    if (!text) return;

    // Clear input & show message
    input.value = '';
    addMessage('user', text);
    chatHistory.push({ role: 'user', content: text });

    showTypingIndicator();

    try {
        // Find existing user identity if any and strip @gmail.com
        let userEmailRaw = localStorage.getItem('aviator_contact') || localStorage.getItem('aviator_bot_user') || 'anonymous';
        let userEmail = userEmailRaw.split('@')[0];

        const sessionStatus = getUserSessionStatus();
        let currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // Detect local vs production to decide which API to hit
        const isLocalDev = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:';

        const apiUrl = isLocalDev ? 'http://localhost:5000/api/ai/chat' : AI_BACKEND_URL;

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: generateSessionId(),
                message: text,
                userContext: userEmail,
                pageLocation: currentPage,
                isLoggedIn: sessionStatus.isLoggedIn,
                sessionStatus: sessionStatus, // Send full detailed status
                history: chatHistory
            })
        });

        const data = await res.json();
        hideTypingIndicator();

        if (data && data.reply) {
            addMessage('ai', data.reply);
            chatHistory.push({ role: 'assistant', content: data.reply });
        } else {
            addMessage('ai', "I'm having a little trouble connecting to my brain right now. Please try again in a moment.");
        }
    } catch (err) {
        console.error("AI Chat Error:", err);
        hideTypingIndicator();
        addMessage('ai', "There was a network error. Ensure you are connected to the internet and try again.");
    }
}
