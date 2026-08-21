import {
  verificationOrderConfirmedTemplate,
  verificationPaymentReceivedTemplate,
  verificationAdminNotificationTemplate
} from "../../templates/verificationTransactionTemplates.js";
import { sendMail } from "../../emailService.js";

export const verificationTransactionHandler = async (job) => {
  const { user, orderNumber, overallBillingTotal, emailTable, amount, adminEmails, adminCc } = job.data;

  if (!user || !orderNumber || !emailTable) {
    throw new Error("Missing required fields for verification_transaction job");
  }

  // Email 1: Order Confirmation (Candidate)
  const orderHtml = verificationOrderConfirmedTemplate(user, orderNumber, overallBillingTotal, emailTable);
  await sendMail({
        type: "verification",
    to: user.email,
    subject: "Order Confirmation : QuikChek - Thank You for Your Purchase!",
    html: orderHtml
  });

  // Email 2: Payment Received (Candidate)
  const paymentHtml = verificationPaymentReceivedTemplate(user, orderNumber, emailTable);
  await sendMail({
        type: "verification",
    to: user.email,
    subject: "Payment Received: QuikChek - Your Order is Confirmed!",
    html: paymentHtml
  });

  // Email 3: Admin Notification (Admin)
  const adminHtml = verificationAdminNotificationTemplate(user, orderNumber, amount, emailTable);
  await sendMail({
        type: "verification",
    to: adminEmails,
    cc: adminCc,
    subject: "Payment Received: QuikChek - " + user.name + " Has Paid for Order #" + orderNumber,
    html: adminHtml
  });
};
