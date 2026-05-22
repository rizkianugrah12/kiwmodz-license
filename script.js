// Konfigurasi Link Iklan
const _0x5e6f = "https://www.effectivecpmnetwork.com/fkgfbf7y?key=b39d1a2af3fc7927cb51dc646c52e21d";

const MAX_STEPS = 5;
const WAIT_TIME = 10; // 10 Detik

let currentStep = 0;
let countdown = WAIT_TIME;
let timerInterval = null;
let isTabActive = true;

// Variabel Token Keamanan berantai
let currentServerToken = null;

const btn = document.getElementById('mainBtn');
const stepInfo = document.getElementById('stepInfo');
const keyBox = document.getElementById('keyBox');
const keyValue = document.getElementById('keyValue');

// ----------------------------------------------------
// SISTEM ANTI-INJEKSI KELAS BERAT (CLIENT-SIDE)
// ----------------------------------------------------
(function() {
    // 1. Cek apakah fungsi asli browser telah dimanipulasi oleh ekstensi/script luar
    const isNative = (fn) => /\[native code\]/.test(fn.toString());
    
    if (!isNative(setInterval) || !isNative(setTimeout) || !isNative(fetch)) {
        alert("CRITICAL WARNING: Modifikasi Sistem Terdeteksi! Fungsi inti browser Anda telah disabotase oleh Ekstensi/Script Bypasser.");
        document.body.innerHTML = "<h1 style='color:red;text-align:center;margin-top:20%'>AKSES DIBLOKIR. MATIKAN EXTENSION CHEAT / TAMPERMONKEY ANDA.</h1>";
        throw new Error("Sistem disabotase");
    }

    // 2. Kunci object penting agar tidak bisa dioverride oleh hacker
    Object.freeze(window.location);
})();

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

// 3. Verifikasi Langkah ke Server (Dipanggil SETIAP 1 langkah selesai)
async function verifyStepWithServer(stepToVerify) {
    try {
        const response = await fetch('/api/step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                step: stepToVerify,
                previousToken: currentServerToken
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Jika server merestui, simpan token baru untuk langkah berikutnya
            currentServerToken = data.token;
            return true;
        } else {
            // Jika server mendeteksi SpeedHack di langkah tertentu
            keyValue.style.color = "red";
            alert("PERINGATAN SERVER: " + (data.error || "Akses Ilegal"));
            document.body.innerHTML = `<h1 style='color:red;text-align:center;margin-top:20%'>${data.error}</h1>`;
            return false;
        }
    } catch (err) {
        alert("Gagal terhubung ke server keamanan!");
        return false;
    }
}

// 4. Minta Key Final
async function requestKeyFromServer() {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentServerToken })
        });

        const data = await response.json();

        if (response.ok && data.key) {
            keyValue.innerText = data.key;
        } else {
            keyValue.innerText = "ERROR: " + (data.error || "Gagal membuat key");
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
    // Langkah Awal (0)
    if (currentStep === 0) {
        btn.innerText = "MEMBUKA KONEKSI SERVER...";
        btn.disabled = true;
        
        // Minta token langkah 0
        const success = await verifyStepWithServer(0);
        if (!success) return;
    }

    if (currentStep >= MAX_STEPS) return;

    window.open(_0x5e6f, '_blank');

    btn.disabled = true;
    countdown = WAIT_TIME;
    btn.innerText = `Menunggu... ${countdown}s`;

    clearInterval(timerInterval);
    timerInterval = setInterval(async () => {
        if (!isTabActive) return;

        countdown--;
        btn.innerText = `Menunggu... ${countdown}s`;

        if (countdown <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            
            // Server Side Verifikasi per tahap (Wajib!)
            btn.innerText = "SINKRONISASI SERVER...";
            const success = await verifyStepWithServer(currentStep + 1);
            if (!success) return; // Langsung mati jika pakai SpeedHack
            
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

// 3. Pencegahan modifikasi fungsi nextStep
Object.defineProperty(window, 'nextStep', {
    writable: false,
    configurable: false
});