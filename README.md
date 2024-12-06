# Lambda Serverless Function for Webapp
SNS will invoke the Lambda function when a new user account is created from a message posted on the web application.
The Lambda function is responsible for the following:
1. Use Sendgrid as a mailing service to send email with authenticated domain.
2. Email the user a link they can click to verify their email address. The verification link expires after 2 minutes.

Clone the repository and zip the contents to ```lambda-email-verification.zip``` to use it with webapp and AWS Terraform IaC.
