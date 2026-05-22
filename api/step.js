const crypto = require('crypto');

const SECRET = "kiwmodz_super_secret_123_STEP!";

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
    }

    const { step, previousToken } = req.body;
    const currentTime = Date.now();

    // Langkah 0 (Mulai)
    if (step === 0) {
        const dataToSign = `0|${currentTime}`;
        const hash = crypto.createHmac('sha256', SECRET).update(dataToSign).digest('hex');
        const token = `${dataToSign}|${hash}`;
        return res.status(200).json({ token: token });
    }

    // Langkah 1 sampai 5
    if (!previousToken) {
        return res.status(403).json({ error: 'Akses Ditolak: Token Hilang!' });
    }

    // Parse Token Sebelumnya
    const parts = previousToken.split('|');
    if (parts.length !== 3) {
        return res.status(403).json({ error: 'Akses Ditolak: Token Rusak!' });
    }

    const prevStep = parseInt(parts[0]);
    const prevTime = parseInt(parts[1]);
    const prevHash = parts[2];

    // Validasi Integritas Token Lama
    const expectedHash = crypto.createHmac('sha256', SECRET).update(`${prevStep}|${prevTime}`).digest('hex');
    if (prevHash !== expectedHash) {
        return res.status(403).json({ error: 'Bypass Terdeteksi: Token Dimanipulasi!' });
    }

    // Validasi Urutan Langkah (Hanya boleh maju 1 langkah)
    if (prevStep !== step - 1) {
        return res.status(403).json({ error: 'Bypass Terdeteksi: Langkah Dipercepat/Melompat!' });
    }

    // Validasi Waktu Per Langkah (MINIMAL 9.5 DETIK DARI SERVER)
    // Walaupun dipercepat di tahap 1-4, server akan memblokirnya SATU PER SATU di setiap tahapan!
    const timeElapsed = (currentTime - prevTime) / 1000;
    if (timeElapsed < 9.5) {
        return res.status(403).json({ 
            error: `SpeedHack Terdeteksi di Langkah ${step}! Waktu di server baru berjalan ${timeElapsed.toFixed(1)} detik. Tunggu genap 10 detik.` 
        });
    }

    // Lolos Validasi? Buatkan Token Baru untuk Langkah Selanjutnya
    const dataToSign = `${step}|${currentTime}`;
    const hash = crypto.createHmac('sha256', SECRET).update(dataToSign).digest('hex');
    const newToken = `${dataToSign}|${hash}`;

    return res.status(200).json({ token: newToken });
}
