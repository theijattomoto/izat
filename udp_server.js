const ModbusRTU = require('modbus-serial');
const SerialPort = require('serialport');

const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');
const udpServer1 = dgram.createSocket('udp4');
const mysql = require('mysql');
const fs = require('fs');

const express = require('express');
const app = express();
const http = require('http'); // Import the http module
const server = http.createServer(app); // Create an HTTP server

// Import and set up socket.io
const io = require('socket.io')(server);

// Function to log activity
function logActivity(activity) {
  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp}: ${activity}\n`;

  fs.appendFile('activity_log.txt', logEntry, (err) => {
    if (err) {
      console.error('Error logging activity:', err);
    } else {
      console.log('Activity logged successfully.');
    }
  });
}
logActivity('<-----------UDP SERVER START------->');

//-----Modbus Function Start-----------//
/*const client = new ModbusRTU();

const serialPortSettings = {
  baudRate : 9600,
  dataBits : 8,
  stopBits : 1,
  parity: 'even'
};

function readData(){
  client.connectRTUBuffered('COM17', serialPortSettings)
  .then(() => {
    console.log('Connected to Modbus RTU device');
    logActivity('Connected to Modbus RTU device');
    return client.readHoldingRegisters(0x1000, 1);
  })
  .then(data => {
    console.log('Data Read: ', data.data);
    const temperature = (data.data / 10).toFixed(1);
    console.log('Temperature:', temperature); 
    logActivity(`Temperature:  ${temperature}`);
    io.emit('data', temperature.toString());
  })

  .catch(err => {
    console.log('Error:',err);
    logActivity('Modbus Error:',err);
    io.emit('comError', 'Failed to connect to COM port.');
  })
  .finally(() => {
    client.close();
  });
}

readData();
logActivity('Interval');
setInterval(readData, 5000);


//setInterval(readData,5000);
//-----Modbus Function Stop-----//
*/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  
});
// Define a route to open the second HTML page
app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

io.on('connection', (socket) => {
  const malaysiaTimeZoneOffset = 0 * 60; // Malaysia is UTC+8
  // Get the current timestamp
  const now = new Date();
  const timestamp = new Date(now.getTime() + malaysiaTimeZoneOffset * 60000); // Add the offset in minutes
  console.log(`A user connected at ${timestamp}`);
  logActivity(`A user connected at ${timestamp}`);
  // Handle WebSocket events here
});

server.listen(3001, () => {
  console.log('WebSocket server is listening on port 3001');
  logActivity('WebSocket server is listening on port 3001');
});

server.on('listening', () => {
  const address = server.address();
  console.log(`UDP server listening on ${address.address}:${address.port}`);
  logActivity(`UDP server listening on ${address.address}:${address.port}`);
});



// Create a MySQL database connection
/*const db = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 'oilroom',
  database: 'dboilroom'
});*/

// Connect to the database
/*db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    logActivity('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  logActivity('Connected to MySQL database');
});*/

udpServer.on('message', (message, remote) => {
    
    const malaysiaTimeZoneOffset = 0 * 60; // Malaysia is UTC+8
    // Get the current timestamp
    const now = new Date();
    const timestamp = new Date(now.getTime() + malaysiaTimeZoneOffset * 60000); // Add the offset in minutes

    // Format the time (adjust as needed)
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');
    const year = timestamp.getFullYear().toString();
    const month = (timestamp.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so we add 1
    const day = timestamp.getDate().toString().padStart(2, '0');

    const malaysiaTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
    // Handle incoming UDP data here
    console.log(`Received UDP data at ${malaysiaTimeString}: ${message}`);
    logActivity(`Received UDP data at ${malaysiaTimeString}`);
  
    // Emit the data along with the timestamp to connected web clients
    io.emit('dcoflowratedata', message.toString());

    // Parse the JSON temperature data received from the server
    const dcoFlowrateData = JSON.parse(message);
    

    const dust = `${dcoFlowrateData.dcoflowratedata[0]}`;
    //const opacity = `${dcoFlowrateData.dcoflowratedata[1]}`;
    //const steamflowrate = `${dcoFlowrateData.dcoflowratedata[3]}`;
    //const pressure = `${dcoFlowrateData.dcoflowratedata[4]}`;
    
    //const temperature2 = `${temperatureData.sludgetemperature[1]}`;
    console.log(dust);

    // Insert the received data into the database
    /*const sql = 'INSERT INTO udp_data (temperature1, temperature2, remote_address, remote_port, malaysiaTimeString) VALUES (?, ?, ?, ?, ?)';
    const values = [temperature1, temperature2, remote.address, remote.port, malaysiaTimeString];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting data into the database:', err);
      } else {
        console.log(`Data inserted into the database: ${temperature1},${temperature2} at ${malaysiaTimeString}`);
        logActivity(`Data inserted into the database at ${malaysiaTimeString}`);
      }

    }); */   
    
  });
udpServer.bind(2001); // Replace with your desired UDP port
//-----------------------------------------------
udpServer1.on('message', (msg, rinfo) => {
  console.log(`Server 2 received: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

udpServer1.on('listening', () => {
  const address = server.address();
  console.log(`UDP server listening on ${address.address}:${address.port}`);
  logActivity(`UDP server listening on ${address.address}:${address.port}`);
}); 

udpServer1.on('message', (message, remote) => {
    
  const malaysiaTimeZoneOffset = 0 * 60; // Malaysia is UTC+8
  // Get the current timestamp
  const now = new Date();
  const timestamp = new Date(now.getTime() + malaysiaTimeZoneOffset * 60000); // Add the offset in minutes

  // Format the time (adjust as needed)
  const hours = timestamp.getHours().toString().padStart(2, '0');
  const minutes = timestamp.getMinutes().toString().padStart(2, '0');
  const seconds = timestamp.getSeconds().toString().padStart(2, '0');
  const year = timestamp.getFullYear().toString();
  const month = (timestamp.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so we add 1
  const day = timestamp.getDate().toString().padStart(2, '0');

  const malaysiaTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // Handle incoming UDP data here
  console.log(`Received UDP data at ${malaysiaTimeString}: ${message}`);
  logActivity(`Received UDP data at ${malaysiaTimeString}`);

  // Emit the data along with the timestamp to connected web clients
  io.emit('usbcycle', message.toString());

  // Parse the JSON temperature data received from the server
  const cycleData = JSON.parse(message);

  const cycle = `${cycleData.usbcycle[0]}`;
  //const opacity = `${BoilerData.data[0]}`;
  //const steamflowrate = `${BoilerData.data[0]}`;
  //const pressure = `${BoilerData.data[0]}`;
  
  //const temperature2 = `${temperatureData.sludgetemperature[1]}`;
  console.log(cycle);
  

  // Insert the received data into the database
  /*const sql = 'INSERT INTO udp_data (temperature1, temperature2, remote_address, remote_port, malaysiaTimeString) VALUES (?, ?, ?, ?, ?)';
  const values = [temperature1, temperature2, remote.address, remote.port, malaysiaTimeString];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into the database:', err);
    } else {
      console.log(`Data inserted into the database: ${temperature1},${temperature2} at ${malaysiaTimeString}`);
      logActivity(`Data inserted into the database at ${malaysiaTimeString}`);
    }

  }); */   
  
});
udpServer1.bind(2000); // Replace with your desired UDP port


