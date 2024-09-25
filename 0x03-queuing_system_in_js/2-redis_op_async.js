import { createClient, print } from "redis";
import { promisify } from 'util';

const client = createClient();
client.on('error', (err) => {
    console.log('Redis client not connected to the server:',err.toString())
});

client.on('connect', async () => {
    console.log('Redis client connected to the server');
    await main();
});

const setNewSchool = (schoolname, value) => {
    client.SET(schoolname, value, print);
}

const displaySchoolValue = async (schoolName) => {
    console.log(await promisify(client.GET).bind(client)(schoolName))
}

async function main() {
    displaySchoolValue('Holberton');
    setNewSchool('HolbertonSanFrancisco', '100');
    displaySchoolValue('HolbertonSanFrancisco');
}