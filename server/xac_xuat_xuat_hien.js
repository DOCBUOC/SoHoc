const jsdom = require("jsdom");
const _ = require("lodash");
const moment = require("moment");
const {JSDOM} = jsdom;
const db = require('./db');
const BASE_URL = 'https://xosodaiphat.com/xsmb-';
const DATE_DB = 'YYYY-MM-DD';
const DATE_URL = 'DD-MM-YYYY';
const {
    thong_ke_so_lan_xuat_hien_from_to,
    thong_ke_so_lan_xuat_hien_theo_thang_quy_nam
} = require('./thong_ke_tan_suat_xuat_hien');

async function xac_xuat_xuat_hien(req, res) {
    let from = req.query.fromDate && moment(req.query.fromDate).isValid() ? moment(req.query.fromDate) : moment();
    let _fromClone = _.cloneDeep(from);
    let period = req.query.period ? parseInt(req.query.period) : 30;
    let to = _fromClone.add(period, 'days');
    console.log(to.format(DATE_DB));
    let khoang_cach = req.query.khoang_cach ? parseInt(req.query.khoang_cach) : 2;
    from.subtract(khoang_cach, 'days').format(DATE_DB);
    to.subtract(khoang_cach, 'days').format(DATE_DB);
    let tang_dan = 0;
    let results = {}
    do {
        req.query.fromDate =  from.add(khoang_cach, 'days').format(DATE_DB);
        req.query.toDate = to.add(khoang_cach, 'days').format(DATE_DB);
        let _data = await thong_ke_so_lan_xuat_hien_from_to(req, res, true);
        _.forEach(_data, function (row) {
            if (_.isEmpty(results[row.raw_number])) {
                results[row.raw_number] = {};
            }
            if (_.isEmpty(results[row.raw_number]['data'])) {
                results[row.raw_number]['data'] = [];
            }
            results[row.raw_number]['name'] = row.raw_number;
            results[row.raw_number]['data'].push(row.count / period);
        });
        tang_dan += khoang_cach;
    } while ((tang_dan <= period + khoang_cach) && to.isBefore(moment()));
    return res.json(_.values(results));
}

module.exports = {
    xac_xuat_xuat_hien
};