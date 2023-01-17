const nodeAbi = require('node-abi')

console.log(nodeAbi.getAbi('12.14.0', 'node'));
console.log(nodeAbi.getAbi('12.0.2', 'electron'));

console.log(nodeAbi.getAbi('16.4.1', 'node'));
console.log(nodeAbi.getAbi('12.0.2', 'electron'));