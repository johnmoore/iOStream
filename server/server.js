var sendgrid = require('sendgrid');
var config = require('getconfig');

var sendgrid_username = config.SENDGRID_USERNAME;
var sendgrid_password = config.SENDGRID_PASSWORD;
if (sendgrid_username) {   
    var sendgrid = require('sendgrid')(sendgrid_username, sendgrid_password);
} else {
    sendgrid = undefined;
    console.log("disabling email support");
}
var crypto = require('crypto');

var io = require('socket.io').listen(2000, {log: false});
io.sockets.on('connection', function(client){

    client.on('message', function(err, msg){
        k = Object.keys(io.sockets.manager.roomClients[client.id]);
        if (k[1] != undefined) {
            chan = k[1].substring(1, k[1].length);
           client.broadcast.to(chan).emit('message', err);
        }
    });
    client.on('pics', function(data, err){
        if (sendgrid == undefined) {
            console.log("received email request but could not service");
            return;
        }
        console.log("pics rec'd");

        imgs = data.msg.img_array;
        email_addr = unescape(data.msg.email);

        today = new Date();

        var email = new sendgrid.Email();
        
        email.addTo(email_addr);
        email.setFrom("iOStream");
        email.setSubject('[iOStream] Screenshots from ' + today.toDateString());

        email.setText('Hi! Attached are your screenshots with annotations from ' + today.toLocaleString());
        email.addHeader({'X-Sent-Using': 'SendGrid-API'});
        email.addHeader({'X-Transport': 'web'});

        for (ii = 0; ii < imgs.length; ii++)
        {
        var b64string = unescape(imgs[ii]);
        b64string = b64string.substring(23);

        var buf = new Buffer(b64string, 'base64');

        email.addFile({content: buf, filename: 'ss'+ (ii + 1) +'.jpg'});
        }


        sendgrid.send(email, function(err, json) {  
        if (err) { return console.error(err); }
          console.log(json);
        });


    });

    client.on('subscribe', function(data) { 
        var hash = crypto.createHash('md5').update(data.room).digest('hex').substring(0, 8).toLowerCase();
        console.log('joining room', hash);
        k = Object.keys(io.sockets.manager.roomClients[client.id]);
        client.join(hash); 
    });
    client.on('channel', function(data) { 
        console.log('joining room', data.room.toLowerCase());
        client.join(data.room); 
    });
 });
