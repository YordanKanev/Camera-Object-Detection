import express from 'express';
import bodyParser from 'body-parser';
import config from "./config";
import mongoose from "mongoose";
import Device from "./models/Device";
import MailService from './services/mail-service';
const app = express();

mongoose.connect(config.connectionString, {useNewUrlParser: true},function(err){
    if(err){
        console.log(err.message);
    }
})

const mailService = new MailService();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.listen(config.port, () => console.log(`Example app listening on port ${config.port}!`));

app.get('/', (req,res) => res.send('Hello World'));

app.post('/device', function(req,res){
    var request = req.body;
    res.json();
    Device.findOne({deviceId: request.deviceId}, function(err,doc){
        if(err){
            console.log(err);
        }else{
            console.log(doc.ownerId);
            mailService.sendEmail({email: doc.ownerId, image: request.image});
        }
    })
});


function sendEmail(data){

}


