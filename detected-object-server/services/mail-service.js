import nodemailer from "nodemailer";
import config from '../config';
var mailService = {};
var transporter;


mailService.sendEmail = function(data){
    var mailOptions = formatMailOptions({
        from: config.email.sender,
        to: data.email,
        subject: 'Camera Object Detection',
        text: "This is a test.",
        image: data.image
    });
    transporter.sendMail(mailOptions, function(err,info){
        if(err){
            console.log(err);
        }else{
            console.log("Email sent: " + info.response);
        }
    })
}

function formatMailOptions(data){
    return {
        from: data.from,
        to: data.to,
        subject: data.subject,
        text: data.text,
        attachments: [
            {
                path: data.image
            }
        ]
    }
}

module.exports = function(){
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email.authentication,
            pass: config.email.password
        }
    });
    return mailService;
}