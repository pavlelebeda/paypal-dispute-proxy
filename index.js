const functions = require('@google-cloud/functions-framework');
const FormData = require('form-data');
const axios = require('axios');

const PROXY_AUTH_TOKEN = process.env.PROXY_AUTH_TOKEN;

functions.http('submitPaypalEvidence', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!PROXY_AUTH_TOKEN || !authHeader || authHeader !== `Bearer ${PROXY_AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing Bearer token' });
  }

  try {
    const { accessToken, disputeId, fileName, base64File, evidenceType, notes } = req.body;

    if (!accessToken || !disputeId || !base64File) {
      return res.status(400).json({ error: 'Missing required fields (accessToken, disputeId, base64File)' });
    }

    const fileBuffer = Buffer.from(base64File, 'base64');
    const form = new FormData();

    const metadata = {
      evidences: [
        {
          evidence_type: evidenceType || 'PROOF_OF_FULFILLMENT',
          notes: notes || 'Uploaded supporting evidence.'
        }
      ]
    };

    form.append('input', JSON.stringify(metadata), {
      contentType: 'application/json'
    });

    form.append('evidence-file', fileBuffer, {
      filename: fileName || 'evidence.pdf',
      contentType: 'application/pdf'
    });

    const paypalUrl = `https://api-m.sandbox.paypal.com/v1/customer/disputes/${disputeId}/provide-evidence`;
    
    const response = await axios.post(paypalUrl, form, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...form.getHeaders()
      }
    });

    return res.status(response.status).json(response.data);

  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: error.message };
    return res.status(status).json(data);
  }
});