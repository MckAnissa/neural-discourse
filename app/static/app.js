// Neural Discourse - Frontend Application
// Cyberpunk Terminal Interface

let currentConversationId = null;
let providers = [];
let totalTokens = 0;
let messageCount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initMatrixBackground();
    initTesseract();
    initHexDecoration();
    initGlitchEffect();
    initTabNavigation();
    await loadProviders();
    await loadConversations();
    console.log('%c⬡ NEURAL DISCOURSE INITIALIZED', 'color: #00ff9d; font-size: 14px; font-weight: bold;');
});

// 4D Tesseract (Hypercube) Animation
function initTesseract() {
    const canvas = document.getElementById('tesseract');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // High DPI support for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const displaySize = 100;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const centerX = displaySize / 2;
    const centerY = displaySize / 2;
    const scale = 34;

    // 16 vertices of a tesseract (4D hypercube): all combinations of +-1 in 4D
    const vertices4D = [];
    for (let i = 0; i < 16; i++) {
        vertices4D.push([
            (i & 1) ? 1 : -1,
            (i & 2) ? 1 : -1,
            (i & 4) ? 1 : -1,
            (i & 8) ? 1 : -1
        ]);
    }

    // 32 edges - connect vertices differing by exactly one coordinate
    const edges = [];
    for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
            let diff = 0;
            for (let k = 0; k < 4; k++) {
                if (vertices4D[i][k] !== vertices4D[j][k]) diff++;
            }
            if (diff === 1) edges.push([i, j]);
        }
    }

    let time = 0;

    function draw() {
        // Clear canvas completely for transparent background
        ctx.clearRect(0, 0, displaySize, displaySize);

        // Multi-axis 4D rotation angles
        const a1 = time * 0.015;  // XW plane
        const a2 = time * 0.012;  // YZ plane
        const a3 = time * 0.008;  // XY plane
        const a4 = time * 0.018;  // ZW plane

        // Project all vertices
        const projected = vertices4D.map(v => {
            let [x, y, z, w] = v;

            // XW rotation
            let c = Math.cos(a1), s = Math.sin(a1);
            [x, w] = [x * c - w * s, x * s + w * c];

            // YZ rotation
            c = Math.cos(a2); s = Math.sin(a2);
            [y, z] = [y * c - z * s, y * s + z * c];

            // XY rotation
            c = Math.cos(a3); s = Math.sin(a3);
            [x, y] = [x * c - y * s, x * s + y * c];

            // ZW rotation
            c = Math.cos(a4); s = Math.sin(a4);
            [z, w] = [z * c - w * s, z * s + w * c];

            // 4D to 3D perspective projection
            const d4 = 2.5;
            const w4 = 1 / (d4 - w);
            const x3 = x * w4;
            const y3 = y * w4;
            const z3 = z * w4;

            // 3D to 2D perspective projection
            const d3 = 3;
            const w3 = 1 / (d3 - z3);

            return {
                x: x3 * w3 * scale + centerX,
                y: y3 * w3 * scale + centerY,
                depth: z3 + w  // Combined depth for rendering order
            };
        });

        // Sort and draw edges
        const edgeData = edges.map(([i, j]) => ({
            i, j,
            depth: (projected[i].depth + projected[j].depth) / 2
        })).sort((a, b) => a.depth - b.depth);

        edgeData.forEach(({ i, j, depth }) => {
            const p1 = projected[i];
            const p2 = projected[j];

            // Depth-based alpha and width for 3D effect
            const normalizedDepth = (depth + 2) / 4;
            const alpha = 0.3 + normalizedDepth * 0.7;
            const lineWidth = 0.8 + normalizedDepth * 1.2;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 255, 213, ${Math.min(alpha, 1)})`;
            ctx.lineWidth = Math.max(lineWidth, 0.8);
            ctx.lineCap = 'round';
            ctx.stroke();
        });

        // Draw small vertices at corners (subtle, not prominent)
        projected.forEach(p => {
            const normalizedDepth = (p.depth + 2) / 4;
            const alpha = 0.4 + normalizedDepth * 0.4;

            // Small dot at vertex
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 213, ${Math.min(alpha + 0.2, 1)})`;
            ctx.fill();
        });

        time++;
        requestAnimationFrame(draw);
    }

    draw();
}

// Matrix rain - green and cyan only
function initMatrixBackground() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Mix of characters for more visual interest
    const chars = '01アイウエオカキクケコサシスセソタチツテト⬡⬢△▽◇';
    const charArray = chars.split('');
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];
    const speeds = [];
    const brightness = [];
    const colorType = []; // 0 = green, 1 = cyan

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
        speeds[i] = 0.5 + Math.random() * 0.5;
        brightness[i] = 0.7 + Math.random() * 0.3;
        // Mix: 70% green, 30% cyan (no purple)
        colorType[i] = Math.random() < 0.7 ? 0 : 1;
    }

    function draw() {
        // Darker fade for longer trails
        ctx.fillStyle = 'rgba(10, 10, 15, 0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            const y = drops[i] * fontSize;

            // Bright head of the stream
            if (Math.random() > 0.9) {
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = colorType[i] === 1 ? '#00ffd5' : '#00ff9d';
                ctx.shadowBlur = 12;
            } else {
                const b = brightness[i];
                if (colorType[i] === 1) {
                    // Cyan stream
                    const intensity = Math.floor(180 + b * 75);
                    ctx.fillStyle = `rgb(0, ${Math.floor(intensity * 0.85)}, ${intensity})`;
                } else {
                    // Green stream
                    const green = Math.floor(200 + b * 55);
                    ctx.fillStyle = `rgb(0, ${green}, ${Math.floor(green * 0.6)})`;
                }
                ctx.shadowBlur = 0;
            }

            ctx.fillText(char, i * fontSize, y);
            ctx.shadowBlur = 0;

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
                drops[i] = 0;
                brightness[i] = 0.7 + Math.random() * 0.3;
                // Occasionally change stream color
                if (Math.random() > 0.7) {
                    colorType[i] = Math.random() < 0.7 ? 0 : 1;
                }
            }
            drops[i] += speeds[i];
        }
    }

    setInterval(draw, 35);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Hex decoration in corner
function initHexDecoration() {
    const hexEl = document.getElementById('hex-decoration');
    if (!hexEl) return;

    function updateHex() {
        const now = new Date();
        const hex = [
            `0x${now.getHours().toString(16).padStart(2, '0')}`,
            `0x${now.getMinutes().toString(16).padStart(2, '0')}`,
            `0x${now.getSeconds().toString(16).padStart(2, '0')}`,
        ].join(':');

        const memHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');

        hexEl.innerHTML = `
            <div>SYS.TIME ${hex}</div>
            <div>MEM.ADDR 0x${memHex}</div>
            <div>STATUS: ACTIVE</div>
        `;
    }

    updateHex();
    setInterval(updateHex, 1000);
}

// Subtle glitch effect on logo
function initGlitchEffect() {
    const logo = document.querySelector('.logo-text');
    if (!logo) return;

    setInterval(() => {
        if (Math.random() > 0.95) {
            logo.style.transform = `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)`;
            setTimeout(() => {
                logo.style.transform = 'translate(0, 0)';
            }, 50);
        }
    }, 100);
}

// Load providers and models
async function loadProviders() {
    try {
        const response = await fetch('/api/models/providers', {
            headers: getApiHeaders()
        });
        providers = await response.json();

        // Update status indicators
        providers.forEach(p => {
            const dot = document.getElementById(`${p.name}-status`);
            if (dot) {
                dot.classList.toggle('active', p.configured);
                dot.classList.toggle('inactive', !p.configured);
            }
        });

        // Populate model selects
        populateModelSelects();
    } catch (error) {
        console.error('Failed to load providers:', error);
    }
}

function populateModelSelects() {
    const selects = ['new-model-a', 'new-model-b', 'edit-model-a', 'edit-model-b'];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '';

        providers.forEach(provider => {
            if (!provider.configured) return;

            const optgroup = document.createElement('optgroup');
            optgroup.label = `// ${provider.name.toUpperCase()}`;

            provider.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                option.dataset.provider = provider.name;
                optgroup.appendChild(option);
            });

            select.appendChild(optgroup);
        });
    });

    // Set defaults: Claude for A, Llama for B
    const modelA = document.getElementById('new-model-a');
    const modelB = document.getElementById('new-model-b');

    if (modelA && modelA.options.length > 0) {
        for (let opt of modelA.options) {
            if (opt.dataset?.provider === 'anthropic') {
                modelA.value = opt.value;
                break;
            }
        }
    }

    if (modelB && modelB.options.length > 0) {
        for (let opt of modelB.options) {
            if (opt.dataset?.provider === 'groq') {
                modelB.value = opt.value;
                break;
            }
        }
    }
}

// Load conversations
async function loadConversations() {
    try {
        const response = await fetch('/api/conversations/');
        const conversations = await response.json();

        const list = document.getElementById('conversation-list');
        list.innerHTML = '';

        if (conversations.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 2rem 1rem;">
                    <div style="font-size: 0.7rem; color: var(--text-dim);">// no sessions found</div>
                </div>
            `;
            return;
        }

        conversations.forEach((conv, index) => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.dataset.id = conv.id;
            if (conv.id === currentConversationId) {
                item.classList.add('active');
            }

            const date = new Date(conv.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            item.innerHTML = `
                <div class="conversation-title">${escapeHtml(conv.title)}</div>
                <div class="conversation-meta">[${String(index).padStart(2, '0')}] ${date} // ${conv.model_a.split('-')[0]}↔${conv.model_b.split('-')[0]}</div>
            `;

            item.onclick = () => selectConversation(conv.id);
            list.appendChild(item);
        });
    } catch (error) {
        console.error('Failed to load conversations:', error);
    }
}

// Select conversation
async function selectConversation(id) {
    currentConversationId = id;

    // Update UI - highlight selected conversation
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.id) === id);
    });

    // Show conversation UI elements
    document.getElementById('chat-header').style.display = 'flex';
    document.getElementById('controls-panel').style.display = 'flex';
    document.getElementById('settings-panel').style.display = 'block';

    // Load conversation details
    try {
        const [convResponse, messagesResponse] = await Promise.all([
            fetch(`/api/conversations/${id}`),
            fetch(`/api/conversations/${id}/messages`)
        ]);

        const conversation = await convResponse.json();
        const messages = await messagesResponse.json();

        // Update header
        document.getElementById('chat-title').textContent = conversation.title;

        // Update settings panel
        document.getElementById('edit-model-a').value = conversation.model_a;
        document.getElementById('edit-model-b').value = conversation.model_b;
        document.getElementById('edit-system-a').value = conversation.system_prompt_a || '';
        document.getElementById('edit-system-b').value = conversation.system_prompt_b || '';
        document.getElementById('edit-starter').value = conversation.starter_message;

        // Update stats
        updateStats(messages);

        // Render messages (this will clear empty state automatically)
        renderMessages(messages, conversation.starter_message);
    } catch (error) {
        console.error('Failed to load conversation:', error);
    }
}

// Clear/deselect current conversation - go back to empty state
function clearSelection() {
    currentConversationId = null;

    // Remove active class from all conversation items
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });

    // Hide conversation UI elements
    document.getElementById('chat-header').style.display = 'none';
    document.getElementById('controls-panel').style.display = 'none';
    document.getElementById('settings-panel').style.display = 'none';

    // Show empty state
    document.getElementById('messages-container').innerHTML = `
        <div class="empty-state" id="empty-state">
            <div class="empty-icon">⬡</div>
            <div class="empty-text">Awaiting Input</div>
            <div class="empty-hint">// Initialize a new session to begin model discourse</div>
        </div>
    `;

    // Reset stats
    totalTokens = 0;
    messageCount = 0;
}

function updateStats(messages) {
    messageCount = messages.length;
    totalTokens = messages.reduce((sum, m) => sum + (m.token_count || 0), 0);

    const msgEl = document.getElementById('stat-messages');
    const tokEl = document.getElementById('stat-tokens');

    if (msgEl) msgEl.textContent = messageCount;
    if (tokEl) tokEl.textContent = totalTokens.toLocaleString();
}

// Create rotating cube avatar HTML
function createAvatarHTML() {
    return `<div class="ai-avatar">
        <div class="cube">
            <div class="cube-face front"></div>
            <div class="cube-face back"></div>
            <div class="cube-face right"></div>
            <div class="cube-face left"></div>
            <div class="cube-face top"></div>
            <div class="cube-face bottom"></div>
        </div>
    </div>`;
}

function renderMessages(messages, starterMessage) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';

    // Show starter message
    if (starterMessage) {
        const starterDiv = document.createElement('div');
        starterDiv.className = 'message message-model-a';
        starterDiv.innerHTML = `
            <div class="message-header">
                <span class="message-model">${createAvatarHTML()}Init</span>
                <span class="message-tokens">seed</span>
            </div>
            <div class="message-content">${escapeHtml(starterMessage)}</div>
        `;
        container.appendChild(starterDiv);
    }

    // Render conversation messages
    messages.forEach((msg, index) => {
        const div = document.createElement('div');
        div.className = `message message-${msg.role.replace('_', '-')}`;

        const modelName = msg.model_name.split('-').slice(0, 2).join(' ');
        const tokens = msg.token_count ? `${msg.token_count} tok` : '';

        div.innerHTML = `
            <div class="message-header">
                <span class="message-model">${createAvatarHTML()}${modelName}</span>
                <span class="message-tokens">#${String(index + 1).padStart(2, '0')} ${tokens}</span>
            </div>
            <div class="message-content">${escapeHtml(msg.content)}</div>
        `;

        container.appendChild(div);
    });

    container.scrollTop = container.scrollHeight;
}

// Run conversation
async function runConversation() {
    if (!currentConversationId) return;

    const turns = parseInt(document.getElementById('turns').value) || 5;
    const runBtn = document.getElementById('run-btn');
    const loading = document.getElementById('loading');

    runBtn.disabled = true;
    runBtn.style.opacity = '0.5';
    loading.style.display = 'flex';

    try {
        const response = await fetch(`/api/conversations/${currentConversationId}/run`, {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify({ conversation_id: currentConversationId, turns })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            const container = document.getElementById('messages-container');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message message-model-a';
            errorDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-model">${createAvatarHTML()}System</span>
                    <span class="message-tokens">error</span>
                </div>
                <div class="message-content" style="color: var(--purple-primary);">⚠ API Error ${response.status}: ${escapeHtml(errorText)}</div>
            `;
            container.appendChild(errorDiv);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const container = document.getElementById('messages-container');

        let currentMessageDiv = null;
        let localMsgCount = messageCount;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value).split('\n').filter(l => l.trim());

            for (const line of lines) {
                try {
                    const event = JSON.parse(line);

                    if (event.type === 'start') {
                        localMsgCount++;
                        currentMessageDiv = document.createElement('div');
                        currentMessageDiv.className = `message message-${event.role.replace('_', '-')}`;
                        currentMessageDiv.innerHTML = `
                            <div class="message-header">
                                <span class="message-model">${createAvatarHTML()}${event.model.split('-').slice(0, 2).join(' ')}</span>
                                <span class="message-tokens">#${String(localMsgCount).padStart(2, '0')}</span>
                            </div>
                            <div class="message-content">
                                <div class="loading">
                                    <span>generating</span>
                                    <div class="loading-dots"><span></span><span></span><span></span></div>
                                </div>
                            </div>
                        `;
                        container.appendChild(currentMessageDiv);
                        container.scrollTop = container.scrollHeight;
                    }

                    if (event.type === 'message' && currentMessageDiv) {
                        const content = currentMessageDiv.querySelector('.message-content');
                        const tokens = currentMessageDiv.querySelector('.message-tokens');
                        content.textContent = event.content;
                        tokens.textContent = `#${String(localMsgCount).padStart(2, '0')} ${event.tokens || 0} tok`;
                        container.scrollTop = container.scrollHeight;

                        // Update stats
                        totalTokens += event.tokens || 0;
                        const tokEl = document.getElementById('stat-tokens');
                        const msgEl = document.getElementById('stat-messages');
                        if (tokEl) tokEl.textContent = totalTokens.toLocaleString();
                        if (msgEl) msgEl.textContent = localMsgCount;
                    }

                    if (event.type === 'error') {
                        console.error('Stream error:', event.error);
                        // Create error message div if none exists
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'message message-model-a';
                        errorDiv.innerHTML = `
                            <div class="message-header">
                                <span class="message-model">${createAvatarHTML()}System</span>
                                <span class="message-tokens">error</span>
                            </div>
                            <div class="message-content" style="color: var(--purple-primary);">⚠ ${escapeHtml(event.error)}</div>
                        `;
                        container.appendChild(errorDiv);
                        container.scrollTop = container.scrollHeight;
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                }
            }
        }

        messageCount = localMsgCount;
    } catch (error) {
        console.error('Run failed:', error);
    } finally {
        runBtn.disabled = false;
        runBtn.style.opacity = '1';
        loading.style.display = 'none';
    }
}

// Create new conversation
async function createConversation() {
    const data = {
        title: document.getElementById('new-title').value || 'unnamed_session',
        model_a: document.getElementById('new-model-a').value,
        model_b: document.getElementById('new-model-b').value,
        system_prompt_a: document.getElementById('new-system-a').value || null,
        system_prompt_b: document.getElementById('new-system-b').value || null,
        starter_message: document.getElementById('new-starter').value
    };

    if (!data.starter_message) {
        alert('// ERROR: Init prompt required');
        return;
    }

    try {
        const response = await fetch('/api/conversations/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const conversation = await response.json();
        closeModal();
        await loadConversations();
        selectConversation(conversation.id);

        // Reset form
        document.getElementById('new-title').value = '';
        document.getElementById('new-system-a').value = '';
        document.getElementById('new-system-b').value = '';
        document.getElementById('new-starter').value = 'What is it like being you?';
    } catch (error) {
        console.error('Failed to create conversation:', error);
        alert('// ERROR: Session creation failed');
    }
}

// Delete conversation
async function deleteCurrentConversation() {
    if (!currentConversationId) return;

    if (!confirm('// CONFIRM: Delete this session?')) return;

    try {
        await fetch(`/api/conversations/${currentConversationId}`, {
            method: 'DELETE'
        });

        currentConversationId = null;
        document.getElementById('chat-header').style.display = 'none';
        document.getElementById('controls-panel').style.display = 'none';
        document.getElementById('settings-panel').style.display = 'none';
        document.getElementById('messages-container').innerHTML = `
            <div class="empty-state" id="empty-state">
                <div class="empty-icon">⬡</div>
                <div class="empty-text">Awaiting Input</div>
                <div class="empty-hint">// Initialize a new session to begin model discourse</div>
            </div>
        `;

        await loadConversations();
    } catch (error) {
        console.error('Failed to delete:', error);
    }
}

// Export conversation
async function exportConversation() {
    if (!currentConversationId) return;

    try {
        const [convResponse, messagesResponse] = await Promise.all([
            fetch(`/api/conversations/${currentConversationId}`),
            fetch(`/api/conversations/${currentConversationId}/messages`)
        ]);

        const conversation = await convResponse.json();
        const messages = await messagesResponse.json();

        const exportData = {
            meta: {
                framework: 'Neural Discourse',
                version: '0.1.0',
                exported_at: new Date().toISOString()
            },
            session: conversation,
            messages,
            stats: {
                total_messages: messages.length,
                total_tokens: messages.reduce((sum, m) => sum + (m.token_count || 0), 0)
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neural-discourse_${conversation.id}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export failed:', error);
    }
}

// Modal controls
function openNewConversationModal() {
    document.getElementById('new-conversation-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('new-conversation-modal').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('new-conversation-modal')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Escape key closes modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Utility: escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== API Key Management ====================

function getStoredKeys() {
    return {
        anthropic: localStorage.getItem('anthropic_api_key') || '',
        groq: localStorage.getItem('groq_api_key') || '',
        openai: localStorage.getItem('openai_api_key') || '',
        xai: localStorage.getItem('xai_api_key') || '',
        kimi: localStorage.getItem('kimi_api_key') || '',
        gemini: localStorage.getItem('gemini_api_key') || ''
    };
}

function getApiHeaders() {
    const keys = getStoredKeys();
    const headers = { 'Content-Type': 'application/json' };
    if (keys.anthropic) headers['X-Anthropic-Key'] = keys.anthropic;
    if (keys.groq) headers['X-Groq-Key'] = keys.groq;
    if (keys.openai) headers['X-OpenAI-Key'] = keys.openai;
    if (keys.xai) headers['X-XAI-Key'] = keys.xai;
    if (keys.kimi) headers['X-Kimi-Key'] = keys.kimi;
    if (keys.gemini) headers['X-Gemini-Key'] = keys.gemini;
    return headers;
}

function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('active');

    // Load existing keys
    const keys = getStoredKeys();
    document.getElementById('settings-anthropic-key').value = keys.anthropic;
    document.getElementById('settings-groq-key').value = keys.groq;
    document.getElementById('settings-openai-key').value = keys.openai;
    document.getElementById('settings-xai-key').value = keys.xai;
    document.getElementById('settings-kimi-key').value = keys.kimi;
    document.getElementById('settings-gemini-key').value = keys.gemini;

    updateKeyStatuses();
}

function closeSettingsModal() {
    document.getElementById('settings-modal').classList.remove('active');
}

async function updateKeyStatuses() {
    const keys = getStoredKeys();

    const anthropicStatus = document.getElementById('anthropic-key-status');
    const groqStatus = document.getElementById('groq-key-status');
    const openaiStatus = document.getElementById('openai-key-status');
    const xaiStatus = document.getElementById('xai-key-status');
    const kimiStatus = document.getElementById('kimi-key-status');
    const geminiStatus = document.getElementById('gemini-key-status');

    // Check server-side config + local keys
    try {
        const response = await fetch('/api/models/providers', {
            headers: getApiHeaders()
        });
        const providers = await response.json();

        const anthropicProvider = providers.find(p => p.name === 'anthropic');
        const groqProvider = providers.find(p => p.name === 'groq');
        const openaiProvider = providers.find(p => p.name === 'openai');
        const xaiProvider = providers.find(p => p.name === 'xai');
        const kimiProvider = providers.find(p => p.name === 'kimi');
        const geminiProvider = providers.find(p => p.name === 'gemini');

        // Update status for each provider
        function setStatus(el, configured, localKey) {
            if (!el) return;
            if (configured || localKey) {
                el.textContent = 'configured';
                el.className = 'key-status configured';
            } else {
                el.textContent = 'missing';
                el.className = 'key-status missing';
            }
        }

        setStatus(anthropicStatus, anthropicProvider?.configured, keys.anthropic);
        setStatus(groqStatus, groqProvider?.configured, keys.groq);
        setStatus(openaiStatus, openaiProvider?.configured, keys.openai);
        setStatus(xaiStatus, xaiProvider?.configured, keys.xai);
        setStatus(kimiStatus, kimiProvider?.configured, keys.kimi);
        setStatus(geminiStatus, geminiProvider?.configured, keys.gemini);
    } catch (e) {
        console.error('Failed to check key status:', e);
    }
}

function saveApiKeys() {
    const anthropicKey = document.getElementById('settings-anthropic-key').value.trim();
    const groqKey = document.getElementById('settings-groq-key').value.trim();
    const openaiKey = document.getElementById('settings-openai-key').value.trim();
    const xaiKey = document.getElementById('settings-xai-key').value.trim();
    const kimiKey = document.getElementById('settings-kimi-key').value.trim();
    const geminiKey = document.getElementById('settings-gemini-key').value.trim();

    // Save or remove each key
    const keys = [
        ['anthropic_api_key', anthropicKey],
        ['groq_api_key', groqKey],
        ['openai_api_key', openaiKey],
        ['xai_api_key', xaiKey],
        ['kimi_api_key', kimiKey],
        ['gemini_api_key', geminiKey]
    ];

    keys.forEach(([storageKey, value]) => {
        if (value) {
            localStorage.setItem(storageKey, value);
        } else {
            localStorage.removeItem(storageKey);
        }
    });

    // Refresh providers to update status
    loadProviders();
    updateKeyStatuses();
    closeSettingsModal();

    console.log('%c⬡ API keys saved', 'color: #00ff9d;');
}

function clearApiKeys() {
    localStorage.removeItem('anthropic_api_key');
    localStorage.removeItem('groq_api_key');
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('xai_api_key');
    localStorage.removeItem('kimi_api_key');
    localStorage.removeItem('gemini_api_key');
    document.getElementById('settings-anthropic-key').value = '';
    document.getElementById('settings-groq-key').value = '';
    document.getElementById('settings-openai-key').value = '';
    document.getElementById('settings-xai-key').value = '';
    document.getElementById('settings-kimi-key').value = '';
    document.getElementById('settings-gemini-key').value = '';
    loadProviders();
    updateKeyStatuses();
    console.log('%c⬡ API keys cleared', 'color: #bf7af0;');
}

// Settings modal close on overlay click
document.getElementById('settings-modal')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeSettingsModal();
    }
});

// ============================================
// TAB NAVIGATION
// ============================================

function initTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    // Initialize history visualization when history tab is selected
    if (tabId === 'history') {
        initHistoryVisualization();
    }
}

// ============================================
// HISTORY VISUALIZATION - Neural Network Graph
// ============================================

let historyNodes = [];
let historyEdges = [];
let historyAnimationId = null;
let hoveredNode = null;

async function initHistoryVisualization() {
    const canvas = document.getElementById('history-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Cancel previous animation if any
    if (historyAnimationId) {
        cancelAnimationFrame(historyAnimationId);
    }

    // Fetch conversations
    try {
        const response = await fetch('/api/conversations/', {
            headers: getApiHeaders()
        });
        const conversations = await response.json();

        if (conversations.length === 0) {
            drawEmptyState(ctx, canvas);
            return;
        }

        // Fetch messages for each conversation to build nodes
        const nodes = [];
        const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
            'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with',
            'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
            'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
            'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
            'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until',
            'while', 'although', 'what', 'which', 'who', 'this', 'that', 'these', 'those', 'am', 'it', 'its',
            'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their', 'me', 'him',
            'us', 'them', 'about', 'like', 'also', 'well', 'even', 'really', 'think', 'know', 'say', 'get']);

        for (const conv of conversations) {
            const msgResponse = await fetch(`/api/conversations/${conv.id}/messages`, {
                headers: getApiHeaders()
            });
            const messages = await msgResponse.json();

            // Extract keywords from messages
            const allText = messages.map(m => m.content).join(' ').toLowerCase();
            const words = allText.match(/\b[a-z]{4,}\b/g) || [];
            const wordCounts = {};

            words.forEach(word => {
                if (!stopWords.has(word)) {
                    wordCounts[word] = (wordCounts[word] || 0) + 1;
                }
            });

            // Get top 5 keywords
            const keywords = Object.entries(wordCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([word]) => word);

            // Calculate age (for color)
            const createdAt = new Date(conv.created_at);
            const age = Date.now() - createdAt.getTime();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            nodes.push({
                id: conv.id,
                title: conv.title || 'Untitled',
                keywords: keywords,
                messageCount: messages.length,
                age: Math.min(age / maxAge, 1),
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                vx: 0,
                vy: 0,
                radius: Math.min(10 + messages.length * 2, 30)
            });
        }

        // Build edges based on shared keywords (1+ shared for neural network look)
        const edges = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const shared = nodes[i].keywords.filter(k => nodes[j].keywords.includes(k));
                if (shared.length >= 1) {
                    edges.push({
                        source: i,
                        target: j,
                        strength: shared.length,
                        sharedKeywords: shared
                    });
                }
            }
        }

        historyNodes = nodes;
        historyEdges = edges;
        hoveredNode = null;

        // Start animation
        animateGraph(ctx, canvas);

    } catch (e) {
        console.error('Failed to load history:', e);
        drawEmptyState(ctx, canvas);
    }
}

function drawEmptyState(ctx, canvas) {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#4a5568';
    ctx.font = '14px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('No conversations to visualize', canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = '#2d3748';
    ctx.font = '12px JetBrains Mono';
    ctx.fillText('Create sessions to see the network', canvas.width / 2, canvas.height / 2 + 25);
}

function animateGraph(ctx, canvas) {
    const nodes = historyNodes;
    const edges = historyEdges;

    // Force-directed simulation
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Apply forces
    nodes.forEach((node, i) => {
        // Center gravity
        node.vx += (centerX - node.x) * 0.0005;
        node.vy += (centerY - node.y) * 0.0005;

        // Repulsion between nodes
        nodes.forEach((other, j) => {
            if (i === j) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 1000 / (dist * dist);
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
        });
    });

    // Attraction for connected nodes
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 100) * 0.01 * edge.strength;

        source.vx += (dx / dist) * force;
        source.vy += (dy / dist) * force;
        target.vx -= (dx / dist) * force;
        target.vy -= (dy / dist) * force;
    });

    // Update positions with damping
    nodes.forEach(node => {
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;

        // Keep in bounds
        node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));
    });

    // Clear canvas completely (no trailing effect)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw edges (neural network synapses)
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];

        // Create gradient along the edge for neural network effect
        const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
        const alpha = 0.15 + edge.strength * 0.15;
        gradient.addColorStop(0, `rgba(0, 255, 213, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(0, 255, 213, ${alpha * 1.5})`);
        gradient.addColorStop(1, `rgba(0, 255, 213, ${alpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + edge.strength * 0.5;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        // Draw small dots along connection for neural network look
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        ctx.fillStyle = `rgba(0, 255, 213, ${alpha})`;
        ctx.beginPath();
        ctx.arc(midX, midY, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw nodes (neurons) - 3D spheres
    nodes.forEach(node => {
        const isHovered = hoveredNode === node;
        const r = node.radius;

        // Draw outer glow
        const glowRadius = isHovered ? r * 3 : r * 2;
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        glowGradient.addColorStop(0, isHovered ? 'rgba(0, 255, 213, 0.5)' : 'rgba(0, 255, 213, 0.3)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw sphere with 3D gradient (dark at bottom, light at top)
        const sphereGradient = ctx.createRadialGradient(
            node.x - r * 0.3, node.y - r * 0.3, 0,
            node.x, node.y, r * 1.2
        );
        sphereGradient.addColorStop(0, '#7fffef');      // Bright highlight
        sphereGradient.addColorStop(0.2, '#00ffd5');    // Main cyan
        sphereGradient.addColorStop(0.6, '#00c4a7');    // Mid tone
        sphereGradient.addColorStop(1, '#006b5a');      // Dark shadow

        ctx.fillStyle = sphereGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = isHovered ? '#fff' : 'rgba(0, 255, 213, 0.8)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Draw specular highlight (small bright spot)
        const specGradient = ctx.createRadialGradient(
            node.x - r * 0.4, node.y - r * 0.4, 0,
            node.x - r * 0.4, node.y - r * 0.4, r * 0.5
        );
        specGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        specGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        specGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = specGradient;
        ctx.beginPath();
        ctx.arc(node.x - r * 0.3, node.y - r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        ctx.fillStyle = '#fff';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        const label = node.title.length > 12 ? node.title.slice(0, 12) + '...' : node.title;
        ctx.fillText(label, node.x, node.y + node.radius + 15);
    });

    // Draw tooltip for hovered node
    if (hoveredNode) {
        const node = hoveredNode;
        const tooltipX = node.x + node.radius + 15;
        const tooltipY = node.y - 10;

        // Tooltip background
        const tags = node.keywords.slice(0, 5);
        const tooltipWidth = 150;
        const tooltipHeight = 20 + tags.length * 16;

        ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
        ctx.strokeStyle = '#00ffd5';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
        ctx.fill();
        ctx.stroke();

        // Tooltip title
        ctx.fillStyle = '#00ffd5';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('// TAGS', tooltipX + 8, tooltipY + 14);

        // Tooltip tags
        ctx.fillStyle = '#aaa';
        ctx.font = '10px JetBrains Mono';
        tags.forEach((tag, i) => {
            ctx.fillText(`• ${tag}`, tooltipX + 8, tooltipY + 30 + i * 16);
        });

        if (tags.length === 0) {
            ctx.fillStyle = '#666';
            ctx.fillText('No tags extracted', tooltipX + 8, tooltipY + 30);
        }
    }

    historyAnimationId = requestAnimationFrame(() => animateGraph(ctx, canvas));
}

// Handle canvas click to select conversation
document.getElementById('history-canvas')?.addEventListener('click', (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a node
    for (const node of historyNodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
            // Switch to chat tab and select this conversation
            switchTab('chat');
            selectConversation(node.id);
            break;
        }
    }
});

// Handle canvas hover to show tags
document.getElementById('history-canvas')?.addEventListener('mousemove', (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if hovering over a node
    hoveredNode = null;
    for (const node of historyNodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
            hoveredNode = node;
            canvas.style.cursor = 'pointer';
            break;
        }
    }
    if (!hoveredNode) {
        canvas.style.cursor = 'default';
    }
});

// Clear hover when leaving canvas
document.getElementById('history-canvas')?.addEventListener('mouseleave', () => {
    hoveredNode = null;
});

// Handle window resize for history canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('history-canvas');
    if (canvas && document.getElementById('tab-history').classList.contains('active')) {
        initHistoryVisualization();
    }
});
