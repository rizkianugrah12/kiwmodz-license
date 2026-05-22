const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
    }

    // 1. SISTEM ANTI-BYPASS SERVER SIDE
    const { serverTime, token } = req.body;
    
    if (!serverTime || !token) {
        return res.status(400).json({ error: 'Akses Ilegal: Token Tidak Ditemukan!' });
    }

    const SECRET = "kiwmodz_super_secret_123!";
    const expectedHash = crypto.createHmac('sha256', SECRET).update(serverTime.toString()).digest('hex');

    if (token !== expectedHash) {
        return res.status(403).json({ error: 'Bypass Terdeteksi: Token Palsu!' });
    }

    const waktuSekarangDiServer = Date.now();
    const waktuBerlalu = (waktuSekarangDiServer - parseInt(serverTime)) / 1000;

    // WAJIB minimal 48 detik berlalu di jam asli Server Vercel. 
    // Hacker mau pakai aplikasi percepat waktu di HP/PC mereka, TIDAK AKAN Ngaruh ke Server Vercel!
    if (waktuBerlalu < 48) {
        return res.status(403).json({ error: `Bypass Waktu Terdeteksi! Waktu baru berjalan ${Math.floor(waktuBerlalu)} detik di server asli.` });
    }

    // 2. GENERATE KEY DAN SIMPAN
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
