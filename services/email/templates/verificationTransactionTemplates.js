export const verificationOrderConfirmedTemplate = (user, orderNumber, overallBillingTotal, emailTable) => `
  <div style="text-align: center; margin-bottom: 20px;">
<img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
</div>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>Thank you for shopping with QuikChek. We have successfully received your order, and it's now being processed.</p>
    <p><strong>Order Details:</strong></p>
    <p>Order Number: #${orderNumber}</p>
    <p>Payment Amount: #${overallBillingTotal}</p>
    <p>Payment Method: Online</p>

    <p>Thank you for shopping with QuikChek. Here are your order details:</p>
    ${emailTable}
  
    <p>If you have any questions or need further assistance, feel free to reach out to our support team at support@quikchek.in or call us at 8697744701.</p>
    <p>Thank you for choosing QuikChek. We appreciate your trust in us and look forward to serving you again.</p>
    <br />
    <p>Sincerely,<br />
    The Admin Team<br />
    <strong>Global Employability Information Services India Limited</strong></p>

    <div style="text-align: center; margin-top: 30px;">
  <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
</div>
`;

export const verificationPaymentReceivedTemplate = (user, orderNumber, emailTable) => `
  <div style="text-align: center; margin-bottom: 20px;">
<img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
</div>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>Thank you for your payment! We are pleased to inform you that your payment for Order #${orderNumber} has been successfully processed.</p>
   
    <p>Thank you for shopping with QuikChek. Here are your order details:</p>
    ${emailTable}
  
    <p>If you have any questions or need further assistance, feel free to reach out to our support team at support@quikchek.in or call us at 8697744701.</p>
    <p>Thank you for choosing QuikChek. We appreciate your trust in us and look forward to serving you again.</p>
    <br />
    <p>Sincerely,<br />
    The Admin Team<br />
    <strong>Global Employability Information Services India Limited</strong></p>

            <div style="text-align: center; margin-top: 30px;">
  <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
</div>
`;

export const verificationAdminNotificationTemplate = (user, orderNumber, amount, emailTable) => `
<div style="text-align: center; margin-bottom: 20px;">
  <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
</div>

<p>Dear <strong>Admin</strong>,</p>

<p>We are pleased to inform you that <strong>${user.name}</strong> has successfully completed the payment for <strong>Order #${orderNumber}</strong> via QuikChek.
Amount: <strong>₹ ${amount}</strong>
</p>

<p>Below are the order details:</p>
${emailTable}

<p>Please process the order accordingly and ensure timely delivery/service.</p>

<p>If you need any assistance, feel free to contact us at <a href="mailto:support@quikchek.in">support@quikchek.in</a> or call <strong>8697744701</strong>.</p>

<p>Thank you for being a part of the QuikChek team!</p>

<br />
<p>Sincerely,<br />
The Admin Team<br />
<strong>Global Employability Information Services India Limited</strong></p>

<div style="text-align: center; margin-top: 30px;">
  <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
</div>
`;
