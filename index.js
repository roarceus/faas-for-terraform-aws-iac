const AWS = require('aws-sdk');
const sgMail = require('@sendgrid/mail');

const secretsManager = new AWS.SecretsManager();

async function getSendGridSecrets() {
    const secretName = 'sendgrid-secret';
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    return JSON.parse(data.SecretString);
}

exports.handler = async (event) => {
    const secrets = await getSendGridSecrets();
    sgMail.setApiKey(secrets.SENDGRID_API_KEY);
    
    const snsMessage = event.Records[0].Sns.Message;
    const { userId, email, token, expiresAt } = JSON.parse(snsMessage);

    const verificationLink = `https://${secrets.WEBAPP_DOMAIN}/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    const msg = {
        to: email,
        from: secrets.SENDER_EMAIL,
        subject: 'Action Required: Verify Your Email Address',
        text: `
            Hello,
            
            Thank you for signing up! To complete your registration, please verify your email address by clicking the link below:
            
            ${verificationLink}
            
            This link will expire in 2 minutes. If you did not request this email, you can safely ignore it.
            
            Thank you,  
            Sohan Patil
        `,
        html: `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #4CAF50;">Verify Your Email Address</h2>
                    <p>Hello,</p>
                    <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px; margin: 10px 0;">
                        Verify Email
                    </a>
                    <p>If the button above doesn’t work, you can copy and paste the following link into your browser:</p>
                    <p style="word-break: break-word;"><a href="${verificationLink}" style="color: #4CAF50;">${verificationLink}</a></p>
                    <p><em>This link will expire in 2 minutes.</em></p>
                    <p>If you did not request this email, you can safely ignore it.</p>
                    <hr style="border: none; border-top: 1px solid #ccc;" />
                    <p style="font-size: 12px; color: #555;">
                        Need help? Contact me at <a href="mailto:sohan.patil98@gmail.com" style="color: #4CAF50;">sohan.patil98@gmail.com</a>.
                    </p>
                    <p style="font-size: 12px; color: #555;">
                        &copy; Sohan Patil | All Rights Reserved
                    </p>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`Verification email sent to ${email}`);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Verification email sent successfully' }),
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 503,
            body: JSON.stringify({ message: 'Failed to send verification email' }),
        };
    }
};