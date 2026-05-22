// Konfigurasi Link Iklan
const _0x5e6f = "https://www.effectivecpmnetwork.com/fkgfbf7y?key=b39d1a2af3fc7927cb51dc646c52e21d";

const MAX_STEPS = 5;
const WAIT_TIME = 10; // 10 Detik

let currentStep = 0;
let countdown = WAIT_TIME;
let timerInterval = null;
let isTabActive = true;
let startTime = 0;
let stepTimestamps = [];

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

async function requestKeyFromServer() {
    try {
        // HANYA memanggil Backend API lokal (Vercel Serverless)
        // Tidak ada lagi konfigurasi Supabase di Frontend!
        const response = await fetch('/api/generate', {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok && data.key) {
            keyValue.innerText = data.key;
        } else {
            keyValue.innerText = "ERROR: " + (data.error || "Gagal membuat key");
        }
    } catch (err) {
        keyValue.innerText = "ERROR: Koneksi ke server mati.";
    }
}

// 3. Verifikasi Keaslian Waktu
function verifyIntegrity() {
    if (stepTimestamps.length !== MAX_STEPS) return false;
    let totalTime = (Date.now() - startTime) / 1000;
    if (totalTime < ((MAX_STEPS * WAIT_TIME) - 2)) {
        return false;
    }
    return true;
}

window.nextStep = function() {
    if (currentStep === 0) {
        startTime = Date.now();
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
            
            stepTimestamps.push(Date.now());

            if (currentStep < MAX_STEPS) {
                btn.disabled = false;
                btn.innerText = `LANJUT LANGKAH ${currentStep + 1}`;
            } else {
                btn.innerText = "MEMPROSES KEY...";
                
                if (!verifyIntegrity()) {
                    btn.innerText = "BYPASS TERDETEKSI!";
                    btn.style.backgroundColor = "red";
                    btn.style.color = "white";
                    alert("Peringatan Keamanan! Tindakan manipulasi script terdeteksi.");
                    return;
                }

                btn.style.display = 'none';
                stepInfo.style.display = 'none';
                keyBox.style.display = 'block';
                
                // Minta server untuk buat dan simpan key
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