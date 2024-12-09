const jsdom = require("jsdom");
const _ = require("lodash");
const moment = require("moment");
const {JSDOM} = jsdom;
const db = require('./db');
const BASE_URL = 'https://xosodaiphat.com/xsmb-';
const DATE_DB = 'YYYY-MM-DD';
const DATE_URL = 'DD-MM-YYYY';

async function chu_ki_lap_lai_cua_con_so_hang_chuc(req, res) {
    let from = req.query.fromDate && moment(req.query.fromDate).isValid() ? moment(req.query.fromDate) : moment();
    let to = req.query.toDate && moment(req.query.toDate).isValid() ? moment(req.query.toDate) : moment();
    let hangChuc = req.query.hangChuc ? req.query.hangChuc : '0';
    from = from.format(DATE_DB);
    to = to.format(DATE_DB);
    const sql = `
                            WITH hang_chuc_counts AS (
                                SELECT
                                    day,
                                    LEFT(formatted_number, 1) AS hang_chuc,
                                    COUNT(*) AS so_lan_xuat_hien
                                FROM
                                    data
                                WHERE
                                    day BETWEEN '${from}' AND '${to}'
                                GROUP BY
                                    day, hang_chuc
                            ),
                            max_counts_per_day AS (
                                SELECT
                                    day,
                                    MAX(so_lan_xuat_hien) AS max_so_lan_xuat_hien
                                FROM
                                    hang_chuc_counts
                                GROUP BY day
                                HAVING max_so_lan_xuat_hien > 4
                    )
                    SELECT
                        h.day,
                        h.hang_chuc,
                        h.so_lan_xuat_hien
                    FROM
                        hang_chuc_counts h
                            JOIN
                        max_counts_per_day m
                        ON
                            h.day = m.day AND h.so_lan_xuat_hien = m.max_so_lan_xuat_hien
                    ORDER BY
                        h.day, h.hang_chuc;`;
    db.query(sql, function (err, result) {
        if (err) {
            return res.json([]);
        }
        let data = [];
        _.forEach(result, function (row) {
            data.push({
                day: moment(row.day).format('YYYY-MM-DD'),
                hang_chuc: row.hang_chuc,
                count: row.so_lan_xuat_hien
            });
        });
        return res.json(data);
    });
}

async function get_con_so_hang_chuc(req, res) {
    let from = req.query.fromDate && moment(req.query.fromDate).isValid() ? moment(req.query.fromDate) : moment();
    let to = req.query.toDate && moment(req.query.toDate).isValid() ? moment(req.query.toDate) : moment();
    from = from.format(DATE_DB);
    to = to.format(DATE_DB);
    const sql = `SELECT 
                     LEFT(increment_number, 1) AS hang_chuc
                 FROM 
                     increment_number
                 GROUP BY 
                     hang_chuc
                 ORDER BY 
                     hang_chuc`;
    db.query(sql, function (err, result) {
        if (err) {
            return res.json([]);
        }
        let data = [];
        _.forEach(result, function (row) {
            data.push({name: row.hang_chuc});
        });
        return res.json(data);
    });
}

module.exports = {
    chu_ki_lap_lai_cua_con_so_hang_chuc,
    get_con_so_hang_chuc
};