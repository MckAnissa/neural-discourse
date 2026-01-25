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
    await loadProviders();
    await loadConversations();
    console.log('%c⬡ NEURAL DISCOURSE INITIALIZED', 'color: #00ff9d; font-size: 14px; font-weight: bold;');
});

// Rotating 3D Cube Animation (blue/cyan)
function initTesseract() {
    const canvas = document.getElementById('tesseract');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // High DPI support for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const displaySize = 44;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const size = displaySize;
    const scale = 12;

    // 8 vertices of a cube
    const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];

    // 12 edges of a cube
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    function rotate3D(v, ax, ay, az) {
        let [x, y, z] = v;

        // Rotate X
        let cosX = Math.cos(ax), sinX = Math.sin(ax);
        [y, z] = [y * cosX - z * sinX, y * sinX + z * cosX];

        // Rotate Y
        let cosY = Math.cos(ay), sinY = Math.sin(ay);
        [x, z] = [x * cosY + z * sinY, -x * sinY + z * cosY];

        // Rotate Z
        let cosZ = Math.cos(az), sinZ = Math.sin(az);
        [x, y] = [x * cosZ - y * sinZ, x * sinZ + y * cosZ];

        return [x, y, z];
    }

    function project3Dto2D(v) {
        const [x, y, z] = v;
        const distance = 3;
        const w = 1 / (distance - z);
        return [x * w * scale + size / 2, y * w * scale + size / 2, z];
    }

    function draw() {
        ctx.clearRect(0, 0, size, size);

        const projected = vertices.map(v => {
            const rotated = rotate3D(v, angleX, angleY, angleZ);
            return project3Dto2D(rotated);
        });

        // Sort edges by depth for proper rendering
        const sortedEdges = edges.map(([i, j]) => {
            const avgZ = (projected[i][2] + projected[j][2]) / 2;
            return { i, j, depth: avgZ };
        }).sort((a, b) => a.depth - b.depth);

        // Draw edges with blue/cyan gradient based on depth
        sortedEdges.forEach(({ i, j, depth }) => {
            const [x1, y1] = projected[i];
            const [x2, y2] = projected[j];

            // Blue to cyan color range (hue 200-220)
            const hue = 200 + depth * 20;
            const lightness = 50 + depth * 15;
            const alpha = 0.6 + (depth + 1) * 0.2;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
            ctx.lineWidth = 1.5 + (depth + 1) * 0.3;
            ctx.lineCap = 'round';
            ctx.stroke();
        });

        // Draw vertices
        const sortedVerts = projected.map((p, idx) => ({ p, idx }))
            .sort((a, b) => a.p[2] - b.p[2]);

        sortedVerts.forEach(({ p }) => {
            const [x, y, z] = p;
            const radius = 2 + (z + 1) * 0.8;
            const hue = 200 + z * 20;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.9)`;
            ctx.fill();
        });

        // Smooth rotation
        angleX += 0.015;
        angleY += 0.02;
        angleZ += 0.008;

        requestAnimationFrame(draw);
    }

    draw();
}

// Enhanced Matrix rain - purple and green mix
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
    const colorType = []; // 0 = green, 1 = purple, 2 = cyan

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
        speeds[i] = 0.5 + Math.random() * 0.5;
        brightness[i] = 0.7 + Math.random() * 0.3;
        // Mix: 40% green, 40% purple, 20% cyan
        const rand = Math.random();
        colorType[i] = rand < 0.4 ? 0 : (rand < 0.8 ? 1 : 2);
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
                ctx.shadowColor = colorType[i] === 1 ? '#bf7af0' : (colorType[i] === 2 ? '#00d4ff' : '#00ff9d');
                ctx.shadowBlur = 12;
            } else {
                const b = brightness[i];
                if (colorType[i] === 1) {
                    // Purple stream
                    const intensity = Math.floor(120 + b * 80);
                    ctx.fillStyle = `rgb(${intensity}, ${Math.floor(intensity * 0.5)}, ${Math.floor(intensity * 1.2)})`;
                } else if (colorType[i] === 2) {
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
                    const rand = Math.random();
                    colorType[i] = rand < 0.4 ? 0 : (rand < 0.8 ? 1 : 2);
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
        xai: localStorage.getItem('xai_api_key') || ''
    };
}

function getApiHeaders() {
    const keys = getStoredKeys();
    const headers = { 'Content-Type': 'application/json' };
    if (keys.anthropic) headers['X-Anthropic-Key'] = keys.anthropic;
    if (keys.groq) headers['X-Groq-Key'] = keys.groq;
    if (keys.openai) headers['X-OpenAI-Key'] = keys.openai;
    if (keys.xai) headers['X-XAI-Key'] = keys.xai;
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
    } catch (e) {
        console.error('Failed to check key status:', e);
    }
}

function saveApiKeys() {
    const anthropicKey = document.getElementById('settings-anthropic-key').value.trim();
    const groqKey = document.getElementById('settings-groq-key').value.trim();
    const openaiKey = document.getElementById('settings-openai-key').value.trim();
    const xaiKey = document.getElementById('settings-xai-key').value.trim();

    // Save or remove each key
    const keys = [
        ['anthropic_api_key', anthropicKey],
        ['groq_api_key', groqKey],
        ['openai_api_key', openaiKey],
        ['xai_api_key', xaiKey]
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
    document.getElementById('settings-anthropic-key').value = '';
    document.getElementById('settings-groq-key').value = '';
    document.getElementById('settings-openai-key').value = '';
    document.getElementById('settings-xai-key').value = '';
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
