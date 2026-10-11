const _ = require("lodash");
const moment = require("moment");
const DATE_DB = 'YYYY-MM-DD';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Với mỗi bộ ba (a, a+1, a+2): khi a và a+2 cùng ra một ngày thì sau bao nhiêu ngày a+1 mới về (X).
 * - Số giữa về cùng ngày với cặp => X = 0.
 * - Cặp lặp lại khi số giữa chưa về => X vẫn đo từ lần cặp đầu tiên.
 * - Cặp chưa được "giải" đến hết khoảng => dangCho (số ngày chờ tính đến `to`), không tính vào maxX.
 *
 * @param {Object<string, Set<string>>} daysMap  'YYYY-MM-DD' -> các formatted_number ra trong ngày đó
 * @param {string} to  ngày cuối khoảng 'YYYY-MM-DD'
 */
function tinhKhoangCach(daysMap, to) {
    const days = Object.keys(daysMap).sort();
    const rows = [];
    for (let a = 0; a <= 97; a++) {
        const left = pad(a), mid = pad(a + 1), right = pad(a + 2);
        const row = {
            a: left, mid: mid, c: right,
            soLanCap: 0, soLanGiai: 0,
            maxX: null, tuNgay: null, denNgay: null,
            dangCho: null, dangChoTuNgay: null, dangChoCapNgay: [],
            events: [] // từng lần: cặp ra ngày nào (capNgay, gồm cả các lần lặp), số giữa về ngày nào, X
        };
        let pendingStart = null;
        let pendingPairs = [];
        days.forEach(function (day) {
            const set = daysMap[day];
            if (set.has(left) && set.has(right)) {
                row.soLanCap++;
                if (pendingStart === null) {
                    pendingStart = day;
                }
                pendingPairs.push(day);
            }
            if (set.has(mid) && pendingStart !== null) {
                const x = moment(day, DATE_DB).diff(moment(pendingStart, DATE_DB), 'days');
                row.soLanGiai++;
                row.events.push({tuNgay: pendingStart, denNgay: day, x: x, capNgay: pendingPairs});
                if (row.maxX === null || x > row.maxX) {
                    row.maxX = x;
                    row.tuNgay = pendingStart;
                    row.denNgay = day;
                }
                pendingStart = null;
                pendingPairs = [];
            }
        });
        if (pendingStart !== null) {
            row.dangCho = moment(to, DATE_DB).diff(moment(pendingStart, DATE_DB), 'days');
            row.dangChoTuNgay = pendingStart;
            row.dangChoCapNgay = pendingPairs;
        }
        rows.push(row);
    }
    // maxX giảm dần; bộ ba chưa từng có cặp (maxX = null) xuống cuối
    return _.orderBy(rows, [r => r.maxX === null ? -1 : r.maxX, 'a'], ['desc', 'asc']);
}

async function khoang_cach_so_nam_giua(req, res) {
    const db = require('./db'); // lazy: để tinhKhoangCach test được mà không cần kết nối DB
    try {
        const from = (req.query.fromDate && moment(req.query.fromDate).isValid() ? moment(req.query.fromDate) : moment()).format(DATE_DB);
        const to = (req.query.toDate && moment(req.query.toDate).isValid() ? moment(req.query.toDate) : moment()).format(DATE_DB);
        // Bỏ ngày rỗng (cào lỗi): nếu không, số giữa bị tính là "chưa về" oan
        const sql = `SELECT DISTINCT DATE_FORMAT(day, '%Y-%m-%d') AS day, formatted_number
                     FROM data
                     WHERE day >= ? AND day <= ? AND formatted_number <> ''`;
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [from, to], function (err, rows) {
                return err ? reject(err) : resolve(rows);
            });
        });
        const daysMap = {};
        _.forEach(result, function (row) {
            if (!daysMap[row.day]) {
                daysMap[row.day] = new Set();
            }
            daysMap[row.day].add(row.formatted_number);
        });
        const rows = tinhKhoangCach(daysMap, to);
        return res.json({
            fromDate: from,
            toDate: to,
            soNgayCoDuLieu: Object.keys(daysMap).length,
            max: rows[0] && rows[0].maxX !== null ? rows[0] : null,
            rows: rows
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Không tính được khoảng cách'});
    }
}

module.exports = {
    tinhKhoangCach,
    khoang_cach_so_nam_giua
};
