export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
    }

    // Ambil Kunci Rahasia dari Environment Variables Vercel (.env)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

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
