import { createClient, print } from "redis";


const client = createClient();
client.on('error', (err) => {
    console.log('Redis client not connected to the server:',err.toString())
});

client.on('connect', () => {
    console.log('Redis client connected to the server');
});

const setNewSchool = (schoolname, value) => {
    client.SET(schoolname, value, print);
}

const displaySchoolValue = (schoolName) => {
    client.GET(schoolName, (_err, res) => {
        console.log(res)
    })
}

displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');