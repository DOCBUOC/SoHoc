const jsdom = require("jsdom");
const _ = require("lodash");
const moment = require("moment");
const db = require('./db');
const DATE_DB = 'YYYY-MM-DD';
const NUMBER_OF_XIEN = 3
function getAdjacentPairs(input, isLeft) {
    const num = parseInt(input, 10);
    const left = num > 0 ? String(num - 1).padStart(2, '0') : null;
    const right = num < 99 ? String(num + 1).padStart(2, '0') : null;

    const result = [];
    if(left !== null && right !== null){
        result.push(`'${left}', '${input}', '${right}'`);
        console.log('---------------',result)
        return result;
    }
    if (left !== null) {
        result.push(`'${left}', '${input}'`);
    } else if (right !== null) {
        result.push(`'${input}', '${right}'`);
    }
    console.log('---------------',result)
    return result;
}

async function chu_ky_lap_lai_cua_xien(req, res) {
    try {
        let from = req.query.fromDate && moment(req.query.fromDate).isValid() ? moment(req.query.fromDate) : moment();
        let to = req.query.toDate && moment(req.query.toDate).isValid() ? moment(req.query.toDate) : moment();
        let isLeft = !!req.query.isLeft;
        from = from.format(DATE_DB);
        to = to.format(DATE_DB);
        let formatted_number = req.query.formatted_number ? req.query.formatted_number : null;
        let string = getAdjacentPairs(formatted_number,isLeft);
        const sql = `SELECT day, month, year
                        FROM data
                        WHERE formatted_number IN (${string})
                        AND day >= '${from}' AND day <= '${to}'
                        GROUP BY day, month, year
                        HAVING COUNT(DISTINCT formatted_number) = ${NUMBER_OF_XIEN}
                        ORDER BY year, month, day;`;

        const result = await new Promise((resolve, reject) => {
            db.query(sql, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    let data = [];
                    _.forEach(result, function (row){
                        if(moment(row.day).isValid()){
                            data.push(moment(row.day).format('YYYY-MM-DD'));
                        }
                    });
                    resolve(data);
                }
            });
        });
        return res.json(result);
    } catch (error) {
        return res.json({});
    }
}

module.exports = {
    chu_ky_lap_lai_cua_xien
};