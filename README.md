# PayPal Dispute Proxy (GCP Cloud Function)

A Node.js microservice designed to run as an HTTP-triggered Google Cloud Function. It offloads raw `multipart/form-data` stream assembly and sub-part header configuration for the PayPal Dispute API (`/v1/customer/disputes/{dispute_id}/provide-evidence`), bypassing n8n task-runner sandbox limitations.

## Features
- Accepts Base64-encoded PDF files and dispute metadata over JSON.
- Constructs native multi-part requests with explicit sub-headers (`application/json` for metadata and `application/pdf` for attachments).
- Secured via a static Bearer token passed in the request headers.

## Environment Variables
- `PROXY_AUTH_TOKEN`: The static Bearer token used to authenticate requests coming from n8n.

## Deployment Notes (GCP Cloud Functions)
- **Runtime:** Node.js 18+ (or Node.js 20)
- **Entry Point:** `submitPaypalEvidence`
- **Ingress Settings:** Allow unauthenticated invocations (secured via `PROXY_AUTH_TOKEN` in application logic).
