/**
 * Backend API Example: Tender Invitations with File Attachments
 * 
 * This file demonstrates how the backend should handle tender invitation emails
 * with invitation letter attachments.
 * 
 * Endpoint: POST /api/tenders/send-invitations
 */

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure multer for file uploads (if using multipart/form-data)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF and DOCX files
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(
      file.originalname.lastIndexOf('.')
    );

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
    }
  }
});

/**
 * POST /api/tenders/send-invitations
 * Send tender invitation emails with optional file attachments
 */
router.post('/send-invitations', upload.any(), async (req, res) => {
  try {
    let tenderData;
    let recipients = [];
    const attachments = [];

    // Check if request is FormData (with files) or JSON
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Handle FormData request
      tenderData = JSON.parse(req.body.tender);
      const recipientCount = parseInt(req.body.recipientCount || '0');

      // Parse recipients
      for (let i = 0; i < recipientCount; i++) {
        const recipientJson = req.body[`recipient_${i}`];
        if (recipientJson) {
          recipients.push(JSON.parse(recipientJson));
        }
      }

      // Process uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          const recipientIndex = parseInt(file.fieldname.split('_')[1]);
          if (recipientIndex >= 0 && recipientIndex < recipients.length) {
            attachments[recipientIndex] = {
              filename: file.originalname,
              content: file.buffer,
              contentType: file.mimetype,
            };
            console.log(`✓ Attachment prepared for ${recipients[recipientIndex].name}: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);
          }
        });
      }
    } else {
      // Handle JSON request (no attachments)
      const body = req.body;
      tenderData = body.tender;
      recipients = body.recipients || [];
    }

    // Validate required fields
    if (!tenderData || !recipients || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tender data and recipients',
      });
    }

    // Configure email transporter (using environment variables)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send emails to each recipient
    const emailPromises = recipients.map(async (recipient, index) => {
      try {
        const emailSubject = `Tender Invitation: ${tenderData.name}`;
        const emailBody = `
Dear ${recipient.name || 'Contractor'},

You have been invited to participate in the following tender opportunity:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TENDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Name: ${tenderData.name}
Reference Number: ${tenderData.referenceNumber || 'N/A'}
Client: ${tenderData.client || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please click on the link below to view the complete tender details and submit your technical submission:

${tenderData.link}

You will be able to:
• Review all tender requirements
• Upload technical documentation
• Submit your bid response
• Track submission status

${attachments[index] ? 'Please find the invitation letter attached to this email.' : ''}

If you have any questions or need assistance, please contact our tender management team.

Best regards,
ONIX Engineering Team

---
This is an automated message. Please do not reply to this email.
        `.trim();

        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@onixengineering.com',
          to: recipient.email,
          subject: emailSubject,
          text: emailBody,
          html: emailBody.replace(/\n/g, '<br>'),
          attachments: attachments[index] ? [attachments[index]] : [],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✓ Email sent successfully to ${recipient.email}${attachments[index] ? ` with attachment: ${attachments[index].filename}` : ''}`);
        
        return {
          success: true,
          recipient: recipient.email,
          messageId: info.messageId,
          attachmentIncluded: !!attachments[index],
        };
      } catch (emailError) {
        console.error(`✗ Error sending email to ${recipient.email}:`, emailError);
        
        // Log attachment errors specifically
        if (attachments[index]) {
          console.error(`  Attachment error for ${recipient.email}:`, {
            filename: attachments[index].filename,
            size: attachments[index].content?.length || 0,
            error: emailError.message,
          });
        }
        
        return {
          success: false,
          recipient: recipient.email,
          error: emailError.message,
        };
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Log summary
    console.log(`\n📧 Email Summary:`);
    console.log(`  ✓ Sent successfully: ${successful.length}`);
    console.log(`  ✗ Failed: ${failed.length}`);
    if (attachments.length > 0) {
      const withAttachments = successful.filter(r => r.attachmentIncluded).length;
      console.log(`  📎 With attachments: ${withAttachments}`);
    }

    // Return response
    if (successful.length > 0) {
      res.status(200).json({
        success: true,
        message: `Tender invitations sent successfully to ${successful.length} recipient(s)`,
        sentCount: successful.length,
        failedCount: failed.length,
        results: results,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send any invitations',
        errors: failed.map(f => ({ recipient: f.recipient, error: f.error })),
      });
    }
  } catch (error) {
    console.error('✗ Error in send-invitations endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;



