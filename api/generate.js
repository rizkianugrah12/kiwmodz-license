const crypto = require('crypto');

const SECRET = "kiwmodz_super_secret_123_STEP!";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
    }

    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Akses Ilegal: Token Tidak Ditemukan!' });
    }

    // Parse Token
    const parts = token.split('|');
    if (parts.length !== 3) {
        return res.status(403).json({ error: 'Akses Ditolak: Token Rusak!' });
    }

    const prevStep = parseInt(parts[0]);
    const prevTime = parseInt(parts[1]);
    const prevHash = parts[2];

    // Validasi Integritas Token
    const expectedHash = crypto.createHmac('sha256', SECRET).update(`${prevStep}|${prevTime}`).digest('hex');
    if (prevHash !== expectedHash) {
        return res.status(403).json({ error: 'Bypass Terdeteksi: Token Dimanipulasi!' });
    }

    // Pastikan token berasal dari Langkah ke-5
    if (prevStep !== 5) {
        return res.status(403).json({ error: 'Bypass Terdeteksi: Anda belum menyelesaikan semua 5 langkah!' });
    }

    // GENERATE KEY DAN SIMPAN
    const SUPABASE_URL = "https://sngqoqamaaqkasbhdqyk.supabase.co";
    const SUPABASE_KEY = "sb_publishable_mQb1q7mK6a5FqSmRXpB8bg_Z5wTouQh";

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'KIWMODZ-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const finalKey = result;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/license_keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                key_string: finalKey
            })
        });

        if (response.ok) {
            return res.status(200).json({ key: finalKey });
        } else {
            const errText = await response.text();
            return res.status(500).json({ error: errText });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Gagal terhubung ke Database' });
    }
}
