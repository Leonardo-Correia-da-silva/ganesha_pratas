// Uploads are performed exclusively server-side (see api/admin/upload.ts) using the
// Firebase Admin SDK, so the browser never needs write access to Storage. This module
// only re-exports the client Storage instance for potential read-only use cases.
export { storage } from './config'
