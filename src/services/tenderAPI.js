/**
 * Tender API Service
 * Handles tender-related API calls including sending email invitations
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Send tender invitation emails to selected contractors/engineers
 * @param {Object} tenderData - Tender information
 * @param {Array} engineers - Array of selected engineers with email addresses
 * @returns {Promise<Object>} Response from the API
 */
export async function sendTenderInvitations(tenderData, engineers) {
  try {
    // Generate tender link - this would typically include a unique token or ID
    const tenderId = tenderData.id || tenderData.referenceNumber || Date.now().toString();
    const tenderLink = `${window.location.origin}/tender/invitation/${tenderId}`;

    // Check if any engineers have invitation letters
    const hasAttachments = engineers.some(engineer => engineer.invitationLetter !== null);
    
    // Use FormData if there are attachments, otherwise use JSON
    let requestBody;
    let headers;

    if (hasAttachments) {
      // Use FormData for file attachments
      const formData = new FormData();
      
      // Add tender data
      formData.append('tender', JSON.stringify({
        id: tenderId,
        name: tenderData.name,
        referenceNumber: tenderData.referenceNumber,
        client: tenderData.client,
        link: tenderLink,
      }));

      // Add recipients and their invitation letters
      engineers.forEach((engineer, index) => {
        const recipientData = {
          id: engineer.id,
          name: engineer.name,
          email: engineer.email,
          specialty: engineer.specialty,
        };

        // If invitation letter exists, convert base64 to blob and append as file
        if (engineer.invitationLetter && engineer.invitationLetter.data) {
          try {
            // Convert base64 data URL to blob
            const base64Data = engineer.invitationLetter.data;
            const byteString = atob(base64Data.split(',')[1]);
            const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], engineer.invitationLetter.name, { type: mimeString });
            
            formData.append(`invitationLetter_${index}`, file);
            console.log(`Attaching invitation letter for ${engineer.name}: ${engineer.invitationLetter.name} (${(file.size / 1024).toFixed(2)} KB)`);
          } catch (attachmentError) {
            console.error(`Error processing invitation letter for ${engineer.name}:`, attachmentError);
            // Continue without attachment if conversion fails
          }
        }

        formData.append(`recipient_${index}`, JSON.stringify(recipientData));
      });

      formData.append('recipientCount', engineers.length.toString());
      requestBody = formData;
      // Don't set Content-Type header - browser will set it with boundary for FormData
      headers = {};
    } else {
      // Use JSON if no attachments
      const emailData = {
        tender: {
          id: tenderId,
          name: tenderData.name,
          referenceNumber: tenderData.referenceNumber,
          client: tenderData.client,
          link: tenderLink,
        },
        recipients: engineers.map(engineer => ({
          id: engineer.id,
          name: engineer.name,
          email: engineer.email,
          specialty: engineer.specialty,
        })),
      };
      requestBody = JSON.stringify(emailData);
      headers = {
        'Content-Type': 'application/json',
      };
    }

    console.log(`Sending tender invitations to ${engineers.length} recipient(s)${hasAttachments ? ' with attachments' : ''}...`);

    // Call backend API to send emails with attachments
    const response = await fetch(`${API_BASE_URL}/tenders/send-invitations`, {
      method: 'POST',
      headers: headers,
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to send invitations' }));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.message || 'Failed to send tender invitations');
    }

    const result = await response.json();
    console.log('Invitation send result:', result);
    
    return {
      success: true,
      message: result.message || 'Tender invitations sent successfully',
      sentCount: result.sentCount || engineers.length,
      tenderLink,
      attachmentsIncluded: hasAttachments,
      attachmentCount: hasAttachments ? engineers.filter(e => e.invitationLetter).length : 0,
    };
  } catch (error) {
    console.error('Error sending tender invitations:', error);
    
    // Fallback: Generate mailto links for manual sending (if API fails)
    const tenderId = tenderData.id || tenderData.referenceNumber || Date.now().toString();
    const tenderLink = `${window.location.origin}/tender/invitation/${tenderId}`;
    
    // Generate email subject
    const emailSubject = encodeURIComponent(`Tender Invitation: ${tenderData.name}`);

    // Return fallback data with personalized mailto links for each contractor
    return {
      success: false,
      error: error.message,
      fallback: true,
      mailtoLinks: engineers.map(engineer => {
        // Generate personalized email body for each contractor
        const contractorName = engineer.name || 'Contractor';
    const emailBody = encodeURIComponent(
          `Dear ${contractorName},\n\n` +
      `You have been invited to participate in the following tender:\n\n` +
      `Project Name: ${tenderData.name}\n` +
      `Reference Number: ${tenderData.referenceNumber || 'N/A'}\n` +
      `Client: ${tenderData.client || 'N/A'}\n\n` +
      `Please click on the following link to view and respond to this tender invitation:\n` +
      `${tenderLink}\n\n` +
      `Best regards,\n` +
      `ONIX Engineering Team`
    );

    return {
        email: engineer.email,
        name: engineer.name,
        mailto: `mailto:${engineer.email}?subject=${emailSubject}&body=${emailBody}`,
        };
      }),
      tenderLink,
    };
  }
}

/**
 * Generate tender invitation email content
 * @param {Object} tenderData - Tender information
 * @param {string} tenderLink - Link to the tender invitation page
 * @param {string} contractorName - Name of the contractor (optional, defaults to "Contractor")
 * @returns {Object} Email subject and body
 */
export function generateTenderEmailContent(tenderData, tenderLink, contractorName = 'Contractor') {
  const subject = `Tender Invitation: ${tenderData.name}`;
  
  const body = `
Dear ${contractorName},

You have been invited to participate in the following tender opportunity:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TENDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Name: ${tenderData.name}
Reference Number: ${tenderData.referenceNumber || 'N/A'}
Client: ${tenderData.client || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please click on the link below to view the complete tender details and submit your technical submission:

${tenderLink}

You will be able to:
• Review all tender requirements
• Upload technical documentation
• Submit your bid response
• Track submission status

If you have any questions or need assistance, please contact our tender management team.

Best regards,
ONIX Engineering Team

---
This is an automated message. Please do not reply to this email.
  `.trim();

  return { subject, body };
}




