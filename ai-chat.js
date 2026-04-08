/**
 * AviSignals AI Chat — Frontend v2
 *
 * Key improvements over v1:
 *  - Reads auth from Supabase (not localStorage)
 *  - Quick-reply chips so users don't stare at a blank input
 *  - Unread badge on the toggle button
 *  - Smart welcome message based on login state
 *  - Upsell chip appears after AI responses about free code
 *  - Mobile responsive (adapts to small screens)
 *  - Fixed markdown rendering (no broken <ul> wrapping)
 *  - Intent-aware chip sets (changes based on server response)
 *  - Keyboard accessible (Escape closes window)
 *  - No dependency on localStorage for auth state
 */

(function () {
    'use strict';

    // ─── Config ────────────────────────────────────────────────
    const BACKEND_URL = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/ai/chat'
        : 'https://back.avisignals.com/api/ai/chat';

    // Supabase — reads the same client you already init on each page
    // Expects `window.db` to be the Supabase client (set in your HTML head)
    const getSupabaseUser = async () => {
        try {
            if (window.db) {
                const { data: { user } } = await window.db.auth.getUser();
                return user;
            }
        } catch (_) { }
        return null;
    };

    // ─── State ──────────────────────────────────────────────────
    let chatHistory = [];
    let isOpen = false;
    let unreadCount = 0;
    let currentUser = null;   // Supabase user object
    let sessionId = 'chat_' + Math.random().toString(36).slice(2, 11);

    // ─── Quick reply chip sets ──────────────────────────────────
    const CHIP_SETS = {
        welcome: [
            'How do I get my free code?',
            'How does the bot work?',
            'What plans do you have?',
            'Which betting sites work?'
        ],
        after_free_code: [
            'View pricing plans',
            'How do I use my code?',
            'Contact admin on WhatsApp'
        ],
        after_buy: [
            'How do I pay with M-Pesa?',
            'How do I pay with card?',
            'Weekly plan — $250 for 7 days',
            'Contact admin on WhatsApp'
        ],
        general: [
            'Get free daily code',
            'View plans — from $75',
            'How to use the bot',
            'Talk to admin'
        ]
    };

    // ─── CSS ───────────────────────────────────────────────────
    const injectStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
        #avi-chat-toggle {
            position: fixed; bottom: 25px; right: 25px;
            width: 62px; height: 62px;
            background: linear-gradient(135deg, #f1c40f, #d4ac0d);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 6px 20px rgba(241,196,15,0.45);
            cursor: pointer; z-index: 9999;
            transition: transform 0.25s cubic-bezier(0.175,0.885,0.32,1.275);
            border: 3px solid rgba(255,255,255,0.2);
            animation: avi-pulse 3s infinite ease-in-out;
        }
        #avi-chat-toggle:hover { transform: scale(1.12) translateY(-4px); animation-play-state: paused; }
        #avi-chat-toggle i { font-size: 28px; color: #10152b; }
        @keyframes avi-pulse { 0%,100%{box-shadow:0 6px 20px rgba(241,196,15,0.4)} 50%{box-shadow:0 6px 30px rgba(241,196,15,0.7)} }

        #avi-unread-badge {
            display: none; position: absolute; top: -4px; right: -4px;
            background: #e74c3c; color: #fff; border-radius: 50%;
            width: 22px; height: 22px; font-size: 11px; font-weight: 700;
            align-items: center; justify-content: center;
            border: 2px solid #10152b;
        }
        #avi-unread-badge.show { display: flex; }

        .avi-label {
            position: fixed; bottom: 34px; right: 102px;
            background: #fff; color: #10152b;
            padding: 9px 16px; border-radius: 18px;
            border-bottom-right-radius: 3px;
            font-size: 13px; font-weight: 600;
            white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            z-index: 9998; transition: opacity 0.3s;
            animation: avi-label-bob 4s infinite ease-in-out;
        }
        .avi-label::after {
            content:''; position:absolute; bottom:0; right:-7px;
            width:13px; height:13px; background:#fff;
            clip-path: polygon(0 0, 0% 100%, 100% 100%);
        }
        @keyframes avi-label-bob { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-4px)} }

        #avi-chat-window {
            position: fixed; bottom: 100px; right: 20px;
            width: 370px; max-width: calc(100vw - 20px);
            height: min(560px, calc(100vh - 120px));
            background: rgba(11,13,23,0.97);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(241,196,15,0.35);
            border-radius: 18px;
            display: none; flex-direction: column;
            box-shadow: 0 18px 50px rgba(0,0,0,0.65);
            z-index: 9999; overflow: hidden;
            font-family: 'Outfit','Inter','Segoe UI',Arial,sans-serif;
            transition: opacity 0.25s, transform 0.25s;
            opacity: 0; transform: translateY(20px) scale(0.97);
        }
        #avi-chat-window.open {
            display: flex;
            animation: avi-slide-up 0.25s ease forwards;
        }
        @keyframes avi-slide-up {
            to { opacity:1; transform: translateY(0) scale(1); }
        }

        .avi-header {
            background: linear-gradient(135deg, #f1c40f, #c9a20c);
            padding: 13px 18px;
            display: flex; align-items: center; justify-content: space-between;
            flex-shrink: 0;
        }
        .avi-header-left { display:flex; align-items:center; gap:10px; }
        .avi-avatar {
            width: 36px; height: 36px; border-radius: 50%;
            background: #10152b;
            display: flex; align-items: center; justify-content: center;
            font-size: 18px;
        }
        .avi-header-name { font-weight: 700; font-size: 15px; color: #10152b; }
        .avi-header-status { font-size: 11px; color: #1a2a0a; opacity: 0.75; margin-top:1px; }
        .avi-close {
            background: none; border: none;
            font-size: 22px; color: #10152b;
            cursor: pointer; opacity: 0.65; line-height: 1;
            transition: opacity 0.2s;
        }
        .avi-close:hover { opacity: 1; }

        .avi-messages {
            flex: 1; overflow-y: auto;
            padding: 14px 14px 6px;
            display: flex; flex-direction: column; gap: 10px;
            background: #0a0c18;
        }
        .avi-messages::-webkit-scrollbar { width: 4px; }
        .avi-messages::-webkit-scrollbar-track { background: transparent; }
        .avi-messages::-webkit-scrollbar-thumb { background: rgba(241,196,15,0.3); border-radius: 4px; }

        .avi-bubble {
            max-width: 82%; padding: 10px 13px;
            border-radius: 14px; font-size: 13.5px;
            line-height: 1.45; word-wrap: break-word; hyphens: auto;
        }
        .avi-bubble.ai {
            background: #161c35; color: #e8e8e8;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            border: 1px solid rgba(241,196,15,0.12);
        }
        .avi-bubble.user {
            background: #2ecc71; color: #0b1a0f;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            font-weight: 500;
        }
        .avi-bubble.ai a { color: #f1c40f; font-weight: 600; }
        .avi-bubble.ai strong { color: #f1c40f; font-weight: 700; }
        .avi-bubble.ai ul { margin: 6px 0 2px; padding-left: 18px; }
        .avi-bubble.ai li { margin-bottom: 3px; }
        .avi-bubble.ai ol { margin: 6px 0 2px; padding-left: 18px; }

        .avi-typing {
            display: flex; gap: 4px; padding: 10px 13px;
            background: #161c35; border-radius: 14px;
            border-bottom-left-radius: 4px; align-self: flex-start;
            align-items: center;
            border: 1px solid rgba(241,196,15,0.12);
        }
        .avi-typing span {
            width: 6px; height: 6px;
            background: #f1c40f; border-radius: 50%;
            animation: avi-dot 1.4s infinite ease-in-out both;
        }
        .avi-typing span:nth-child(1) { animation-delay: -0.32s; }
        .avi-typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes avi-dot { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }

        .avi-chips {
            display: flex; flex-wrap: wrap; gap: 6px;
            padding: 8px 14px 6px; flex-shrink: 0;
            background: #0a0c18; border-top: 1px solid rgba(255,255,255,0.05);
        }
        .avi-chip {
            background: rgba(241,196,15,0.1);
            border: 1px solid rgba(241,196,15,0.3);
            color: #f1c40f; border-radius: 99px;
            padding: 5px 12px; font-size: 12px;
            cursor: pointer; transition: background 0.2s, transform 0.15s;
            white-space: nowrap;
        }
        .avi-chip:hover { background: rgba(241,196,15,0.2); transform: translateY(-1px); }
        .avi-chip:active { transform: scale(0.97); }

        .avi-input-row {
            display: flex; gap: 8px; padding: 10px 12px;
            background: #10152b; border-top: 1px solid rgba(255,255,255,0.08);
            flex-shrink: 0; align-items: flex-end;
        }
        #avi-input {
            flex: 1; padding: 9px 13px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.1);
            background: #0a0c18; color: #fff;
            outline: none; font-size: 13.5px;
            font-family: inherit; resize: none;
            min-height: 38px; max-height: 90px;
            transition: border-color 0.2s;
            line-height: 1.4;
        }
        #avi-input::placeholder { color: rgba(255,255,255,0.35); }
        #avi-input:focus { border-color: rgba(241,196,15,0.6); }
        #avi-send {
            background: #f1c40f; color: #10152b;
            border: none; width: 38px; height: 38px;
            border-radius: 50%; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; transition: background 0.2s, transform 0.15s;
        }
        #avi-send:hover { background: #d4ac0d; transform: scale(1.08); }
        #avi-send:active { transform: scale(0.95); }
        #avi-send i { font-size: 15px; }

        @media (max-width: 430px) {
            #avi-chat-window { right: 8px; width: calc(100vw - 16px); bottom: 90px; }
            .avi-label { right: 88px; font-size: 12px; padding: 7px 13px; }
            #avi-chat-toggle { bottom: 18px; right: 18px; width: 55px; height: 55px; }
        }
        `;
        document.head.appendChild(style);
    };

    // ─── HTML ───────────────────────────────────────────────────
    const injectHTML = () => {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
        <div class="avi-label" id="avi-label">👋 Hello there,need help with predictions?</div>

        <div id="avi-chat-toggle" role="button" aria-label="Open chat" tabindex="0">
            <i class="fas fa-comment-dots"></i>
            <div id="avi-unread-badge">0</div>
        </div>

        <div id="avi-chat-window" role="dialog" aria-label="AviSignals Support Chat">
            <div class="avi-header">
                <div class="avi-header-left">
                    <div class="avi-avatar">🤖</div>
                    <div>
                        <div class="avi-header-name">ARIA — AviSignals</div>
                        <div class="avi-header-status">● Online • Instant replies</div>
                    </div>
                </div>
                <button class="avi-close" id="avi-close" aria-label="Close chat">&times;</button>
            </div>

            <div class="avi-messages" id="avi-messages"></div>

            <div class="avi-chips" id="avi-chips"></div>

            <div class="avi-input-row">
                <textarea id="avi-input" placeholder="Ask me anything..." rows="1"></textarea>
                <button id="avi-send" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        `;
        document.body.appendChild(wrap);
    };

    // ─── Markdown renderer ──────────────────────────────────────
    // Fixed version — processes block elements before inline ones
    // to avoid the broken <ul> wrapping bug in v1
    function renderMarkdown(text) {
        if (!text) return '';

        const lines = text.split('\n');
        const output = [];
        let inList = false;
        let listType = null;

        const flushList = () => {
            if (inList) {
                output.push(`</${listType}>`);
                inList = false; listType = null;
            }
        };

        lines.forEach(line => {
            // Ordered list item
            if (/^\d+\.\s+/.test(line)) {
                if (!inList || listType !== 'ol') { flushList(); output.push('<ol>'); inList = true; listType = 'ol'; }
                output.push(`<li>${inlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`);
                return;
            }
            // Unordered list item
            if (/^[-*]\s+/.test(line)) {
                if (!inList || listType !== 'ul') { flushList(); output.push('<ul>'); inList = true; listType = 'ul'; }
                output.push(`<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`);
                return;
            }
            // Normal line
            flushList();
            if (line.trim() === '') {
                output.push('<br>');
            } else {
                output.push(`<span>${inlineMarkdown(line)}</span><br>`);
            }
        });

        flushList();
        // Clean up double <br> at end
        return output.join('').replace(/(<br>)+$/, '');
    }

    function inlineMarkdown(text) {
        return text
            // Markdown links [text](url)
            .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            // Bold **text**
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic *text*
            .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
            // Bare URLs (not already in an href)
            .replace(/(?<!href=")(https?:\/\/[^\s<"]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    // ─── UI helpers ─────────────────────────────────────────────
    function addMessage(sender, text) {
        const messages = document.getElementById('avi-messages');
        const bubble = document.createElement('div');
        bubble.className = `avi-bubble ${sender}`;

        if (sender === 'ai') {
            bubble.innerHTML = renderMarkdown(text);
        } else {
            // User messages: plain text only for safety
            bubble.textContent = text;
        }

        messages.appendChild(bubble);
        bubble.scrollIntoView({ behavior: 'smooth', block: 'end' });

        // Unread badge when window is closed
        if (!isOpen && sender === 'ai') {
            unreadCount++;
            const badge = document.getElementById('avi-unread-badge');
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.add('show');
        }

        return bubble;
    }

    function showTyping() {
        const messages = document.getElementById('avi-messages');
        const dot = document.createElement('div');
        dot.className = 'avi-typing';
        dot.id = 'avi-typing';
        dot.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(dot);
        dot.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    function hideTyping() {
        const dot = document.getElementById('avi-typing');
        if (dot) dot.remove();
    }

    function setChips(chips) {
        const container = document.getElementById('avi-chips');
        container.innerHTML = '';
        chips.forEach(label => {
            const btn = document.createElement('button');
            btn.className = 'avi-chip';
            btn.textContent = label;
            btn.onclick = () => sendMessage(label);
            container.appendChild(btn);
        });
    }

    function openChat() {
        const win = document.getElementById('avi-chat-window');
        const lbl = document.getElementById('avi-label');
        win.style.display = 'flex';
        requestAnimationFrame(() => win.classList.add('open'));
        if (lbl) lbl.style.display = 'none';
        isOpen = true;
        // Clear unread badge
        unreadCount = 0;
        const badge = document.getElementById('avi-unread-badge');
        badge.textContent = '0';
        badge.classList.remove('show');
        document.getElementById('avi-input').focus();
    }

    function closeChat() {
        const win = document.getElementById('avi-chat-window');
        const lbl = document.getElementById('avi-label');
        win.classList.remove('open');
        setTimeout(() => { win.style.display = 'none'; }, 250);
        if (lbl) lbl.style.display = 'block';
        isOpen = false;
    }

    // ─── Session status (now reads from Supabase + localStorage fallback) ──
    async function getSessionStatus() {
        let status = {
            isLoggedIn: false,
            hasActiveSession: false,
            assignedSite: 'none',
            hasDailyCode: false,
            dailyCode: '',
            isCodeUsed: false,
            activationType: 'none'
        };

        // 1. Auth state — prefer Supabase, fall back to localStorage
        if (currentUser) {
            status.isLoggedIn = true;
        } else {
            const localContact = localStorage.getItem('aviator_contact');
            if (localContact && localContact !== 'Unknown User') {
                status.isLoggedIn = true;
            }
        }

        // 2. Bot session state (still in localStorage for now — migrate when bot page updates)
        try {
            const sessionRaw = localStorage.getItem('avisignals_session_state_v1');
            if (sessionRaw) {
                const session = JSON.parse(sessionRaw);
                if (session?.expiry > Date.now()) {
                    status.hasActiveSession = true;
                    status.activationType = session.reason || 'active';
                }
            }

            const activationRaw = localStorage.getItem('avisignals_daily_activation_v1');
            if (activationRaw) {
                const act = JSON.parse(activationRaw);
                const today = new Date().toISOString().slice(0, 10);
                if (act?.lastActivatedDate === today) {
                    status.assignedSite = act.site || 'none';
                    status.hasDailyCode = !!act.code;
                    status.dailyCode = act.code || '';
                    status.isCodeUsed = !!act.codeUsed;
                    if (!status.activationType || status.activationType === 'none') {
                        status.activationType = act.activationType || 'none';
                    }
                }
            }

            if (status.assignedSite === 'none') {
                status.assignedSite = localStorage.getItem('selectedSite') || 'none';
            }
        } catch (_) { }

        return status;
    }

    // ─── Core send function ─────────────────────────────────────
    async function sendMessage(text) {
        text = (text || '').trim();
        if (!text) return;

        // Clear input
        const input = document.getElementById('avi-input');
        input.value = '';
        input.style.height = 'auto';

        // Clear chips while waiting
        setChips([]);

        addMessage('user', text);
        chatHistory.push({ role: 'user', content: text });
        showTyping();

        // Re-fetch user to ensure we have the latest auth state
        const freshUser = await getSupabaseUser();
        const contact = freshUser?.email || freshUser?.user_metadata?.phone || localStorage.getItem('aviator_contact') || 'anonymous';
        const displayName = contact.includes('@') ? contact.split('@')[0] : contact;

        try {
            const body = {
                sessionId,
                message: text,
                history: chatHistory.slice(-10),
                userContext: displayName,
                userId: freshUser?.id || null,
                contact: contact,
                pageLocation: window.location.pathname.split('/').pop() || 'index.html',
                isLoggedIn: !!freshUser,
                sessionStatus
            };

            const res = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(15000)
            });

            const data = await res.json();
            hideTyping();

            const reply = data?.reply || "I'm having trouble right now. Try again or WhatsApp us.";
            const intent = data?.intent || 'browsing';

            addMessage('ai', reply);
            chatHistory.push({ role: 'assistant', content: reply });

            // Show relevant chips based on intent
            if (intent === 'ready_to_buy') setChips(CHIP_SETS.after_buy);
            else if (intent === 'needs_guidance') setChips(CHIP_SETS.after_free_code);
            else setChips(CHIP_SETS.general);

        } catch (err) {
            hideTyping();
            console.error('AI Chat error:', err);
            const msg = err.name === 'TimeoutError'
                ? "That took too long. Please check your connection and try again."
                : "Network error. Make sure you're connected and try again.";
            addMessage('ai', msg);
            setChips(CHIP_SETS.general);
        }
    }

    // ─── Welcome message (personalised) ────────────────────────
    async function showWelcome() {
        currentUser = await getSupabaseUser();
        const sessionStatus = await getSessionStatus();
        let msg;

        if (currentUser || sessionStatus.isLoggedIn) {
            const name = currentUser?.user_metadata?.full_name?.split(' ')[0]
                || currentUser?.email?.split('@')[0]
                || 'there';

            if (sessionStatus.hasActiveSession) {
                msg = `Welcome back, **${name}**! 🎯 Your predictor session is active right now — head to the bot and start playing!`;
            } else if (sessionStatus.hasDailyCode && !sessionStatus.isCodeUsed) {
                msg = `Hey **${name}**! 👋 Your free daily code is ready and waiting. Click **Use Bot**, select **${sessionStatus.assignedSite}**, enter your code, and hit **Activate**. Need help?`;
            } else {
                msg = `Welcome back, **${name}**! 🚀 Click **FREE CODE** on the bot page to grab today's prediction code — it's already reserved for you.`;
            }
        } else {
            msg = `Hello! I'm **ARIA**, your AviSignals assistant. 👋\n\nI can help you get predictions, activate your bot, or answer any questions.\n\nWhat can I help you with?`;
        }

        addMessage('ai', msg);
        setChips(CHIP_SETS.welcome);
    }

    // ─── Auto-resize textarea ───────────────────────────────────
    const autoResize = (el) => {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 90) + 'px';
    };

    // ─── Init ───────────────────────────────────────────────────
    const init = () => {
        injectStyles();
        injectHTML();

        const toggle = document.getElementById('avi-chat-toggle');
        const close = document.getElementById('avi-close');
        const input = document.getElementById('avi-input');
        const send = document.getElementById('avi-send');
        const label = document.getElementById('avi-label');

        toggle.addEventListener('click', () => { isOpen ? closeChat() : openChat(); });
        toggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isOpen ? closeChat() : openChat(); } });

        close.addEventListener('click', closeChat);
        label.addEventListener('click', openChat);

        send.addEventListener('click', () => sendMessage(input.value));
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
        });
        input.addEventListener('input', () => autoResize(input));

        // Escape key closes
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeChat(); });

        // Show welcome after short delay
        setTimeout(showWelcome, 900);

        // Show label greeting, hide after 8s
        setTimeout(() => {
            const lbl = document.getElementById('avi-label');
            if (lbl && !isOpen) { lbl.style.opacity = '0'; setTimeout(() => lbl.remove(), 400); }
        }, 8000);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
