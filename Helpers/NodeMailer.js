 import nodemailer from "nodemailer"
 const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'phpdev074@gmail.com',
      pass: 'kflwxejztwzejhom',
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.error(error);
    } else {
      console.log('Transporter is ready to send emails');
    }
  });
  

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: 'phpdev074@gmail.com',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};
export default sendEmail;