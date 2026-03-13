import { createTransport } from "nodemailer";
import { SMTP_USER, SMTP_PASS, APP_NAME } from "../../config/config.service.js";
import {
  BadRequestError,
  InternalServerError,
  ServiceUnavailableError,
} from "./index.js";

const SERVICE = "Gmail";

const transporter = createTransport({
  service: SERVICE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const connectToSMTP = async () => {
  try {
    await transporter.verify();
    console.log("📧  Connected to SMTP Server Successfully");
  } catch (error) {
    console.error("⛔  Failed to Connect to SMTP Server:", error.message);
    process.exit(1);
  }
};

export const composeMail = ({
  to,
  subject,
  text,
  html,
  attachments,
  cc,
  bcc,
}) => {
  // Validate that at Least One Content Type is Provided
  if (!text && !html) {
    throw new BadRequestError("Email MUST have Either Text or HTML Content");
  }

  // Validate Attachments Format
  if (attachments) {
    attachments.forEach((att, index) => {
      if (!att.filename) {
        throw new BadRequestError(
          `Attachment at Index ${index} Missing Filename`,
        );
      }
      if (!att.content && !att.path && !att.href) {
        throw new BadRequestError(
          `Attachment "${att.filename}" MUST have Content, Path, or Href`,
        );
      }
    });
  }

  return {
    from: { name: APP_NAME, address: SMTP_USER },
    to,
    subject,
    ...(text && { text }),
    ...(html && { html }),
    ...(attachments?.length && { attachments }),
    ...(cc?.length && { cc }),
    ...(bcc?.length && { bcc }),
  };
};

export const sendMail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email Sent to: ${mailOptions.to}`);
  } catch (error) {
    // Log the Full Error for Debugging
    console.error(`❌ Failed to Send Email to ${mailOptions.to}:`, error);

    // Distinguish between Different Types of SMTP Errors
    if (error.code === "EAUTH") {
      throw new ServiceUnavailableError("Email Service Authentication Failed");
    }

    if (error.code === "ESOCKET") {
      throw new ServiceUnavailableError("Email Service Connection Failed");
    }

    // Generic Email Failure
    throw new InternalServerError(`Failed to Send Email: ${error.message}`);
  }
};
