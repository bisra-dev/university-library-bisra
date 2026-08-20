import { Client as WorkFlowClient } from "@upstash/workflow";
import config from "@/lib/config";

export const workFlowClient = new WorkFlowClient({
  baseUrl: config.env.upstash.qstashUrl,
  token: config.env.upstash.qstashToken,
});

// TODO: replace with real Resend integration later
export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  console.log(`[stub] Would send email to ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
};