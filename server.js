const express = require('express');
const app = express();
const db = require('./server/db');
const {thong_ke_so_lan_xuat_hien_from_to, thong_ke_so_lan_xuat_hien_theo_thang_quy_nam} = require('./server/thong_ke_tan_suat_xuat_hien');
const {xac_xuat_xuat_hien} = require('./server/xac_xuat_xuat_hien');
const {chu_ki_lap_lai_cua_con_so_hang_chuc, get_con_so_hang_chuc} = require('./server/chu_ki_lap_lai_cua_con_so_hang_chuc');

app.get('/frontend/thong_ke_so_lan_xuat_hien_from_to', (req, res) => {
    res.sendFile(__dirname + '/frontend/thong_ke_so_lan_xuat_hien_from_to.html');
});

app.get('/api/thong_ke_so_lan_xuat_hien_from_to', (req, res) => {
    thong_ke_so_lan_xuat_hien_from_to(req, res);
});

app.get('/frontend/chu_ki_lap_lai_cua_con_so_hang_chuc', (req, res) => {
    res.sendFile(__dirname + '/frontend/chu_ki_lap_lai_cua_con_so_hang_chuc.html');
});

app.get('/api/chu_ki_lap_lai_cua_con_so_hang_chuc', (req, res) => {
    chu_ki_lap_lai_cua_con_so_hang_chuc(req, res);
});
app.get('/api/get_con_so_hang_chuc', (req, res) => {
    get_con_so_hang_chuc(req, res);
});

app.get('/frontend/thong_ke_so_lan_xuat_hien_theo_thang_quy_nam', (req, res) => {
    res.sendFile(__dirname + '/frontend/thong_ke_so_lan_xuat_hien_theo_thang_quy_nam.html');
});

app.get('/api/thong_ke_so_lan_xuat_hien_theo_thang_quy_nam', (req, res) => {
    thong_ke_so_lan_xuat_hien_theo_thang_quy_nam(req, res);
});

app.get('/frontend/xac_xuat_xuat_hien', (req, res) => {
    res.sendFile(__dirname + '/frontend/xac_xuat_xuat_hien.html');
});

app.get('/api/xac_xuat_xuat_hien', (req, res) => {
    xac_xuat_xuat_hien(req, res);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
