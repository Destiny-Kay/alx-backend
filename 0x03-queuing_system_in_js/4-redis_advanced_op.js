import { createClient, print } from "redis";
import { promisify } from 'util';

const client = createClient();
client.on('error', (err) => {
    console.log('Redis client not connected to the server:',err.toString())
});

client.on('connect', async () => {
    console.log('Redis client connected to the server');
    createHash();
});

function createHash() {
    const hashObject = {
        'Portland': 50,
        'Seattle': 80,
        'New York': 20,
        'Bogota': 20,
        'Cali': 40,
        'Paris': 2
    };
    for (const [key, value] of Object.entries(hashObject)) {
        client.HSET('HolbertonSchools', key, value, print);
    };
    client.HGETALL('HolbertonSchools', (_err, res) => console.log(res));
}
