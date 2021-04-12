
const PROTO_PATH = __dirname + '/helloworld.proto';

const grpc = require('@grpc/grpc-js');
const sizeof = require('object-sizeof');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function main() {
  const client = new hello_proto.Greeter("0.0.0.0:50051", grpc.credentials.createInsecure());
  const toSend = {name: 'test'};
  const meta = new grpc.Metadata();
  meta.set("custom", "some-value");
  // what's the correct way to get the content-length?

  const contentLength = Buffer.from(JSON.stringify(toSend)).byteLength;
  console.log(contentLength);

  meta.set("content-length", contentLength); // some library; result: 16 - fails

  // meta.set("content-length", sizeof(toSend)); // some library; result: 16 - fails
  // meta.set('content-length', Buffer.from(JSON.stringify(toSend)).byteLength); // result: 15 - fails
  // meta.set('content-length', client.SayHello.requestSerialize(toSend).length); // result: 6 - fails
  // meta.set('content-length', client.SayHello.requestSerialize(toSend).length + 5); // result: 11 (serialize + 5) - success
  

  // console.log(meta);
  client.sayHello(toSend, meta, function(err, response) {
    if(err) {
      console.log(err);
      return;
    }
    console.log('Greetings:', response.message);
  });
}

main();