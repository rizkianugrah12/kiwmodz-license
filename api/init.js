const crypto = require('crypto');

export default function handler(req, res) {
    // Gunakan CORS jika diperlukan
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Waktu asli dari SERVER (mustahil dicepatkan oleh ekstensi browser)
    const serverTime = Date.now();
    
    // Secret key untuk hash (agar time tidak bisa dipalsukan oleh hacker)
    const SECRET = "kiwmodz_super_secret_123!";
    
    // Buat tanda tangan digital
    const token = crypto.createHmac('sha256', SECRET).update(serverTime.toString()).digest('hex');
    
    res.status(200).json({ 
        serverTime: serverTime, 
        token: token 
    });
}
