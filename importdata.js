const fs = require('fs');
const { parse } = require('csv-parse');
const moment = require('moment');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tickdata',
    password: '2gH10X09postgres',
    port: 5432,
});

const csvData = [];
fs.createReadStream('USATECHIDXUSD.csv')
    .pipe(parse({ delimiter: ',' }))
    .on('data', (dataRow) => {
        // Convert the timestamp to the correct format
        const timestamp = moment(dataRow[0], 'YYYYMMDD HH:mm:ss:SSS').format('YYYY-MM-DD HH:mm:ss.SSS');
        csvData.push([timestamp, dataRow[1], dataRow[2], dataRow[3], dataRow[4]]);
    })
    .on('end', () => {
        const query = 'INSERT INTO nasdaq(Timestamp, Bid_price, Ask_price, Bid_volume, Ask_volume) VALUES ($1, $2, $3, $4, $5)';
        pool.connect((err, client, done) => {
            if (err) throw err;
            try {
                csvData.forEach((row) => {
                    client.query(query, row, (err) => {
                        if (err) {
                            console.log(err.stack);
                        } else {
                            console.log('inserted ' + row);
                        }
                    });
                });
            } finally {
                done();
            }
        });
    });
