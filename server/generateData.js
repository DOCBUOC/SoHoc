const jsdom = require("jsdom");
const _ = require("lodash");
const moment = require("moment");
const {JSDOM} = jsdom;
const db = require('./db');
const BASE_URL = 'https://xosodaiphat.com/xsmb-';
const DATE_DB = 'YYYY-MM-DD';
const DATE_URL = 'DD-MM-YYYY';
db.query("SELECT * FROM data", function (err, result, fields) {
    if (err) throw err;
});

function saveDataToDatabase(date, numbers) {
    const values = numbers.map(number => {
        if (!isNaN(number)) {
            const formattedNumber = number.toString().slice(-2);
            return `(UUID(), '${date}', '${number}', '${formattedNumber}')`;
        }
        return '';
    }).filter(function (v) {
        return v;
    }).join(', ');
    if (values) {
        const sql = `
            INSERT INTO data (id, day, raw_number, formatted_number)
            VALUES ${values} ON DUPLICATE KEY
            UPDATE 
                day = VALUES (day),
                raw_number = IF(raw_number <> VALUES(raw_number), VALUES(raw_number), raw_number),
                formatted_number = IF(raw_number <> VALUES(raw_number), VALUES(formatted_number), formatted_number)`;
        // Thực hiện truy vấn INSERT
        db.query(sql, function (err, result) {
            if (err) {
                console.error(`Error inserting data for date ${date}:`, err);
            } else {
                console.log(`Data for date ${date} inserted successfully`);
            }
        });
    }
}

function generateUrl(date) {
    return BASE_URL + date + '.html';
}

async function extractNumbersFromURL(url, retryCount = 3) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        let cells = doc.querySelectorAll('.table-xsmb tbody tr:nth-child(n+2) td:nth-child(2)');
        let data = [];

        cells.forEach(function (cell) {
            let spans = cell.querySelectorAll('span');
            spans.forEach(function (span) {
                data.push(span.textContent.trim());
            });
        });
        if(retryCount < 3){
            console.log(url);
        }
        return data;
    } catch (error) {
        console.error('Error:', error, url);
        if (retryCount > 0) {
            console.log(`Retrying... Attempts left: ${retryCount}`);
            return extractNumbersFromURL(url, retryCount - 1);
        } else {
            console.log('Max retry count reached. No more attempts.');
            return [];
        }
    }
}

function generateDate(dateString) {
    if (!dateString || !moment(dateString).isValid()) {
        return moment();
    }
    return moment(dateString);
}

function formatDateString(date, yyyymmdd = false) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    if (yyyymmdd) {
        return `${year}-${month}-${day}`;
    }
    return `${day}-${month}-${year}`;
}

function getDataFromDate(startDate, endDate) {
    const _startDate = generateDate(startDate, DATE_URL);
    const _endDate = generateDate(endDate, DATE_URL);
    if (_startDate.isAfter(_endDate)) {
        return;
    }
    const allDates = [];
    let currentDate = _startDate;
    while (currentDate.isBefore(_endDate)) {
        allDates.push(currentDate.format(DATE_URL));
        currentDate.add(1, 'day');
    }

    const promises = allDates.map(date => {
        const url = generateUrl(date);
        return extractNumbersFromURL(url)
            .then(function (numbers) {
                return {
                    date: moment(date, DATE_URL).format(DATE_DB),
                    numbers: numbers.sort((a, b) => a - b)
                }
            })
            .catch(error => {
                console.error(`Lỗi khi trích xuất dữ liệu từ URL ${url}:`, error);
                return {date, numbers: []};
            });
    });
    return Promise.all(promises);
}

getDataFromDate('2025-01-01', '2025-12-31')
    .then(allData => {
        allData.forEach(({date, numbers}) => {
            saveDataToDatabase(date, numbers);
        });

    })
    .catch(error => {
        console.error('Lỗi khi trích xuất dữ liệu:', error);
    });
