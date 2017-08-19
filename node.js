var http = require('http');
var ejs = require('ejs');
var fs = require('fs');
var express = require('express');

var app = express();
 var body = 'default';
var portHTTP = 3050;
var portListen = 1059; 
var siteIP = "172.20.10.4";
'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log( ifname, iface.address);
      var siteIP = iface.address.toString();
    }
    ++alias;
  });
});




//we are not in a request handler so we may use readFileSync
//var content = fs.readFileSync('index.html', 'utf-8');
//var compiled = ejs.compile(content);

http.createServer(function(req,res) {
    /*var temp = 'some temp';

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(compiled({temp: temp}));
    */

    if (req.method == 'POST') {
      //  console.log("POST incoming");
        req.on('data', function (data) {
            body = data;
            console.log("Received: " + body);
        });

        /*req.on('end', function () {
            console.log("Body: " + body);
        }); */
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post received');
    }
    else
    {
        console.log("GET");
        var path = url.parse(req.url).pathname;
        //var html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
        
        switch(path) {
        case '/login':
            //doc = fs.readFile(__dirname + '/subpage.html', fsCallback);
            var html = fs.readFileSync('login.html');
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        break;
        default:
            //doc = fs.readFile(__dirname + '/index.ejs', fsCallback);
            var html = fs.readFileSync('index.ejs');
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        break;
    }

        
    }

}).listen(portListen, siteIP );

/*
app.configure(function() {
    app.set('view engine', 'ejs');  //tell Express we're using EJS
    app.set('views', __dirname + '/views');  //set path to *.ejs files
    app.use(app.router);
    //put your static files (js, css, images) into /public directory
    app.use('/public', express.static(__dirname + '/public'));
});
*/

//app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); 
//app.use('/components', express.static(__dirname + '/components'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

//app.use('/icons', express.static(__dirname + '/icons'));
app.set('views', __dirname + '/views');
//app.use(app.router);
app.use('/public', express.static(__dirname + '/public'));
//app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
    //render index.ejs file
    res.render('index', {val: body});
});

app.get('/ajax', function(req, res){
  res.send(body); //replace with your data here
});

http.createServer(app).listen(portHTTP);

//app.listen(3002)