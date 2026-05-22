export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
    }

    // Hardcode Kunci Rahasia di Backend (Aman karena file ini tidak bisa dilihat pengguna)
    const SUPABASE_URL = "https://sngqoqamaaqkasbhdqyk.supabase.co";
    const SUPABASE_KEY = "sb_publishable_mQb1q7mK6a5FqSmRXpB8bg_Z5wTouQh";

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return res.status(500).json({ error: 'Konfigurasi Server Belum Lengkap' });
    }

    // Server-Side Key Generation (Anti-Inject Nama/Teks)
    // Server akan memaksa key berformat KIWMODZ-XXXXXX
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'KIWMODZ-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const finalKey = result;

    // Kirim key tersebut ke Supabase (Database)
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/license_keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                key_string: finalKey
            })
        });

        if (response.ok) {
            // Jika sukses, kembalikan key tersebut ke Web untuk ditampilkan
            return res.status(200).json({ key: finalKey });
        } else {
            const errText = await response.text();
            return res.status(500).json({ error: errText });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Gagal terhubung ke Database' });
    }
}
