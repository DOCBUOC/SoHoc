const jsdom = require("jsdom");
const _ = require("lodash");
const moment = require("moment");
const {JSDOM} = jsdom;
const db = require('./db');
const BASE_URL = 'https://xosodaiphat.com/xsmb-';
const DATE_DB = 'YYYY-MM-DD';
const DATE_URL = 'DD-MM-YYYY';

async function thong_ke_so_lan_xuat_hien_from_to(req, res, justData) {
    try {
        let from = req.query.fromDate && moment(req.query.fromDate).isValid() ? moment(req.query.fromDate) : moment();
        let to = req.query.toDate && moment(req.query.toDate).isValid() ? moment(req.query.toDate) : moment();
        from = from.format(DATE_DB);
        to = to.format(DATE_DB);
        const sql = `SELECT increment_number AS raw_number,
                        COALESCE(COUNT(DATA.formatted_number), 0) AS count
                 FROM
                     increment_number
                     LEFT JOIN DATA
                 ON increment_number = DATA.formatted_number
                 WHERE day >= '${from}'
                   AND day <= '${to}'
                 GROUP BY
                     formatted_number;`;

        const result = await new Promise((resolve, reject) => {
            db.query(sql, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        if (justData) {
            return result;
        }
        return res.json(result);
    } catch (error) {
        console.error(error);
        if (justData) {
            return [];
        }
        return res.json({});
    }
}

function thong_ke_so_lan_xuat_hien_theo_thang_quy_nam(req, res) {
    let from = req.query.fromDate && moment(req.query.fromDate).isValid() ? moment(req.query.fromDate) : moment();
    let to = req.query.toDate && moment(req.query.toDate).isValid() ? moment(req.query.toDate) : moment();
    let type = req.query.type && ['month', 'quarter', 'year', 'day'].indexOf(req.query.type) > -1 ? req.query.type : 'month';
    from = from.format(DATE_DB);
    to = to.format(DATE_DB);
    let formatted_number = req.query.formatted_number ? req.query.formatted_number : null;
    if (formatted_number) {
        const sql = `SELECT 
                        day
                 FROM
                     increment_number
                     LEFT JOIN DATA
                 ON increment_number = DATA.formatted_number
                 WHERE
                     day >= '${from}'
                   AND day <= '${to}'
                   AND increment_number = '${formatted_number}'
                 ORDER BY increment_number ASC, day ASC;`;
        db.query(sql, function (err, result) {
            if (err) {
                return res.json([]);
            }
            let data = [];
            _.forEach(result, function (row){
                if(moment(row.day).isValid()){
                    data.push(moment(row.day).format('YYYY-MM-DD'));
                }
            });
            return res.json(data);
        });
    } else {
        const sql = `SELECT increment_number AS raw_number,
                        ${type},
                        year,
                        COALESCE(COUNT(DATA.formatted_number), 0) AS count
                 FROM
                     increment_number
                     LEFT JOIN DATA
                 ON increment_number = DATA.formatted_number
                 WHERE
                     day >= '${from}'
                   AND day <= '${to}'
                 GROUP BY
                     formatted_number,
                     ${type},
                     year
                 ORDER BY increment_number ASC, day ASC;`;
        db.query(sql, function (err, result) {
            if (err) {
                return res.json([]);
            }
            let data = {};
            _.forEach(result, function (row) {
                if (_.isEmpty(data[row.raw_number])) {
                    data[row.raw_number] = {};
                }
                if (_.isEmpty(data[row.raw_number]['data'])) {
                    data[row.raw_number]['data'] = [];
                }
                data[row.raw_number]['name'] = row.raw_number;
                data[row.raw_number]['data'].push(row.count);
            });
            return res.json(_.values(data));
        });
    }
}

module.exports = {
    thong_ke_so_lan_xuat_hien_from_to,
    thong_ke_so_lan_xuat_hien_theo_thang_quy_nam
};