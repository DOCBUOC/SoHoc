const express = require('express');
const app = express();
const db = require('./server/db');
const {thong_ke_so_lan_xuat_hien_from_to, thong_ke_so_lan_xuat_hien_theo_thang_quy_nam} = require('./server/thong_ke_tan_suat_xuat_hien');

app.get('/frontend/thong_ke_so_lan_xuat_hien_from_to', (req, res) => {
    res.sendFile(__dirname + '/frontend/thong_ke_so_lan_xuat_hien_from_to.html');
});

app.get('/api/thong_ke_so_lan_xuat_hien_from_to', (req, res) => {
    thong_ke_so_lan_xuat_hien_from_to(req, res);
});

app.get('/frontend/thong_ke_so_lan_xuat_hien_theo_thang_quy_nam', (req, res) => {
    res.sendFile(__dirname + '/frontend/thong_ke_so_lan_xuat_hien_theo_thang_quy_nam.html');
});

app.get('/api/thong_ke_so_lan_xuat_hien_theo_thang_quy_nam', (req, res) => {
    thong_ke_so_lan_xuat_hien_theo_thang_quy_nam(req, res);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
