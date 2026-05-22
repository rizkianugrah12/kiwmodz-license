// Konfigurasi Link Iklan
const _0x5e6f = "https://www.effectivecpmnetwork.com/fkgfbf7y?key=b39d1a2af3fc7927cb51dc646c52e21d";

const MAX_STEPS = 5;
const WAIT_TIME = 10; // 10 Detik

let currentStep = 0;
let countdown = WAIT_TIME;
let timerInterval = null;
let isTabActive = true;

// Variabel Token Keamanan dari Server
let secureServerTime = null;
let secureServerToken = null;

const btn = document.getElementById('mainBtn');
const stepInfo = document.getElementById('stepInfo');
const keyBox = document.getElementById('keyBox');
const keyValue = document.getElementById('keyValue');

// 1. Anti-Inspect Element & Anti-Right Click
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
    }
});

// 2. Anti-Tab Pindah
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isTabActive = false;
        if (currentStep > 0 && currentStep < MAX_STEPS && timerInterval) {
            btn.innerText = "JENDELA TIDAK AKTIF (PAUSED)";
        }
    } else {
        isTabActive = true;
        if (currentStep > 0 && currentStep < MAX_STEPS && timerInterval) {
            btn.innerText = `Menunggu... ${countdown}s`;
        }
    }
});

// 3. Minta Izin Mulai dari Server Asli (Anti Cheat Engine / Fast Forward)
async function initServerTimer() {
    try {
        const response = await fetch('/api/init');
        const data = await response.json();
        secureServerTime = data.serverTime;
        secureServerToken = data.token;
    } catch (err) {
        alert("Gagal terhubung ke server keamanan!");
    }
}

// 4. Minta Key dari Server jika sudah selesai
async function requestKeyFromServer() {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                serverTime: secureServerTime,
                token: secureServerToken
            })
        });

        const data = await response.json();

        if (response.ok && data.key) {
            keyValue.innerText = data.key;
        } else {
            keyValue.innerText = "ERROR: " + (data.error || "Gagal membuat key");
            // Jika ketahuan nge-bypass waktu
            if (response.status === 403) {
                keyValue.style.color = "red";
                alert("PERINGATAN: " + data.error);
            }
        }
    } catch (err) {
        keyValue.innerText = "ERROR: Koneksi ke server mati.";
    }
}

window.nextStep = async function() {
    // Pada langkah 0, inisiasi waktu dari Server Vercel
    if (currentStep === 0) {
        btn.innerText = "MENGHUBUNGKAN KE SERVER...";
        btn.disabled = true;
        await initServerTimer();
        if (!secureServerTime) {
            btn.innerText = "MULAI LANGKAH 1";
            btn.disabled = false;
            return;
        }
    }

    if (currentStep >= MAX_STEPS) return;

    window.open(_0x5e6f, '_blank');

    btn.disabled = true;
    countdown = WAIT_TIME;
    btn.innerText = `Menunggu... ${countdown}s`;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isTabActive) return;

        countdown--;
        btn.innerText = `Menunggu... ${countdown}s`;

        if (countdown <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            currentStep++;
            stepInfo.innerText = `Langkah: ${currentStep} / ${MAX_STEPS}`;
            
            if (currentStep < MAX_STEPS) {
                btn.disabled = false;
                btn.innerText = `LANJUT LANGKAH ${currentStep + 1}`;
            } else {
                btn.innerText = "MEMPROSES KEY...";
                btn.style.display = 'none';
                stepInfo.style.display = 'none';
                keyBox.style.display = 'block';
                
                // Minta server verifikasi waktu dan buat key
                requestKeyFromServer();
            }
        }
    }, 1000);
}

window.copyKey = function() {
    const text = keyValue.innerText;
    if (text && text.includes('KIWMODZ-')) {
        navigator.clipboard.writeText(text);
        const toast = document.getElementById('toast');
        if(toast) {
            toast.className = "toast show";
            setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
        } else {
            alert("Key berhasil disalin!");
        }
    }
}