const jsdom = require("jsdom");
const _ = require("lodash");
const moment = require("moment");
const db = require('./db');
const DATE_DB = 'YYYY-MM-DD';
const NUMBER_OF_XIEN = 3
function getAdjacentPairs(input) {
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

function getTienDanh(i, xien_may = 2) {
    if(xien_may == 2){
        let tien = {
            1: 10,
            2: 10,
            3: 10,
            4: 10,
            5: 20,
            6: 23,
            7: 26,
            8: 29,
            9: 35,
            10: 40,
            11: 45,
            12: 50,
            13: 55,
            14: 65,
            15: 70,
            16: 70,
            17: 70,
            18: 90,
            19: 90,
            20: 90,
            21: 120,
            22: 140,
            23: 160,
            24: 200,
            25: 220,
            26: 240,
            27: 260,
            28: 280,
            29: 300,
            30: 310,
            31: 315,
            32: 340,
            33: 380,
            34: 450,
            35: 480,
            36: 510,
            37: 540,
            38: 570,
            39: 600,
            40: 630,
        }
        if (i <= 40) {
            return tien[i];
        }
        return 30 * (i - 40) + 600;
    }
    let tien = {
        1:  10,
        2:  10,
        3:  10,
        4:  10,
        5:  10,
        6:  10,
        7:  10,
        8:  10,
        9:  10,
        10: 10,
        11: 10,
        12: 10,
        13: 10,
        14: 10,
        15: 10,
        16: 10,
        17: 10,
        18: 10,
        19: 10,
        20: 10,
        21: 10,
        22: 10,
        23: 10,
        24: 10,
        25: 10,
        26: 10,
        27: 10,
        28: 10,
        29: 10,
        30: 10,
        31: 20,
        32: 20,
        33: 20,
        34: 20,
        35: 20,
        36: 20,
        37: 20,
        38: 20,
        39: 20,
        40: 20,
        41: 20,
        42: 20,
        43: 20,
        44: 20,
        45: 20,
        46: 20,
        47: 20,
        48: 20,
        49: 20,
        50: 20,
        51: 20,
        52: 20,
        53: 20,
        54: 20,
        55: 20,
        56: 20,
        57: 20,
        58: 20,
        59: 20,
        60: 20,
        61: 30,
        62: 30,
        63: 30,
        64: 30,
        65: 30,
        66: 30,
        67: 30,
        68: 30,
        69: 30,
        70: 30,
        71: 30,
        72: 30,
        73: 30,
        74: 30,
        75: 30,
        76: 30,
        77: 30,
        78: 30,
        79: 30,
        80: 30,
    }
    if (i <= 80) {
        return tien[i];
    }
    return 30 * (i - 80) + 40;

}


/**
 *
 * @param from
 * @param to
 * @param formatted_number
 * @returns {Promise<unknown>}
 * @private
 */
async function _chu_ky_lap_lai_cua_xien(from, to, formatted_number) {
    try {
        let string = getAdjacentPairs(formatted_number);
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
                    _.forEach(result, function (row) {
                        if (moment(row.day).isValid()) {
                            data.push(moment(row.day).format('YYYY-MM-DD'));
                        }
                    });
                    resolve(data);
                }
            });
        });
        return result;
    } catch (error) {
        return [];
    }
}

async function _get_formatted_numbers() {
    try {
        const sql = `SELECT increment_number AS raw_number
                     FROM increment_number
                     ORDER by increment_number ASC;`;
        const result = await new Promise((resolve, reject) => {
            db.query(sql, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    let data = [];
                    _.forEach(result, function (row) {
                        data.push(row.raw_number);
                    });
                    resolve(data);
                }
            });
        });
        return result;
    } catch (error) {
        return [];
    }
}

async function tinh_lai_to() {
    let formatedNumbers = await _get_formatted_numbers();
    let numberIndex = 0;
    let maxTien = 0;
    let maxLai = 0;
    while (numberIndex < 60) {
        console.log('dang tinh tien cho con so: ', formatedNumbers[numberIndex])
        let fromDate = moment('2025-01-01');
        let from = fromDate.format(DATE_DB);
        let toDate = moment('2025-12-31');
        let to = toDate.format(DATE_DB);
        let days = await _chu_ky_lap_lai_cua_xien(from, to, formatedNumbers[numberIndex]);
        // let days = await _chu_ky_lap_lai_cua_xien(from, to, 10);
        let tien_danh_day_N = 0;
        let tong_tien_danh_cua_N = 0;
        let max_tien_of_N = 0;
        let tong_tien_lai_cua_N = 0;
        let day_index_cua_N = 0;
        while (fromDate.isBefore(toDate) || fromDate.isSame(toDate)) {
            day_index_cua_N++;
            const day = fromDate.format(DATE_DB);
            tien_danh_day_N = getTienDanh(day_index_cua_N, 3);
            tong_tien_danh_cua_N += tien_danh_day_N;
            if (days.indexOf(day) > -1) {
                let tien_trung = tien_danh_day_N * 17;
                tong_tien_lai_cua_N += tien_trung - tong_tien_danh_cua_N;
                maxLai = tong_tien_lai_cua_N > maxLai ? tong_tien_lai_cua_N : maxLai;
                max_tien_of_N = tong_tien_danh_cua_N > max_tien_of_N ? tong_tien_danh_cua_N : max_tien_of_N;
                // console.log('day: ', day, day_index_cua_N);
                // console.log('tien_danh_day_N: ', tien_danh_day_N);
                // console.log('tien trung: ', tien_trung);
                // console.log('tong_tien_danh_cua_N: ', tong_tien_danh_cua_N);
                // console.log('tien lai: ', tong_tien_lai_cua_N, "\n");
                // reset tien chi, day_index_cua_N, tong_tien_danh_cua_N
                tien_danh_day_N = 0;
                day_index_cua_N = 0;
                tong_tien_danh_cua_N = 0;
            }
            fromDate.add(1, 'day');
        }
        console.log('max tien: ', max_tien_of_N);
        console.log('tien lai: ', tong_tien_lai_cua_N);
        maxTien = max_tien_of_N > maxTien ? max_tien_of_N : maxTien;
        numberIndex++;
    }

    console.log(maxTien, maxLai)

}


tinh_lai_to();