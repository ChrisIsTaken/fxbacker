const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tickdata',
    password: '2gH10X09postgres',
    port: 5432,
});

const batchSize = 1000; // Adjust the batch size as per your needs

const insertData = async (data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = 'INSERT INTO nasdaq (timestamp, bid_price, ask_price, bid_volume, ask_volume) VALUES ($1, $2, $3, $4, $5)';
        let insertedCount = 0;
        for (let i = 0; i < data.length; i += batchSize) {
            const batchData = data.slice(i, i + batchSize);
            const values = batchData.flatMap(row => Object.values(row));
            await client.query(query, values);
            insertedCount += batchData.length;
            console.log(`Inserted ${insertedCount} rows.`);
        }
        await client.query('COMMIT');
        console.log('Data inserted successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error inserting data: ${err}`);
    } finally {
        client.release();
    }
};

const csvData = [];

fs.createReadStream('USATECHIDXUSD.csv')
    .pipe(csv())
    .on('data', (dataRow) => {
        // Log the first row to the console
        console.log(dataRow);

        // Modify the timestamp to remove the fractional seconds
        // Replace 'Timestamp' with the actual name of the timestamp column
        dataRow.Timestamp = dataRow.Timestamp.substring(0, dataRow.Timestamp.lastIndexOf(':'));

        csvData.push(dataRow);

        // Check if the batch size is reached, then insert the batch
        if (csvData.length >= batchSize) {
            insertData(csvData);
            csvData.length = 0; // Clear the array
        }
    })
    .on('end', () => {
        // Insert the remaining data (less than the batch size)
        if (csvData.length > 0) {
            insertData(csvData);
        }
    });
