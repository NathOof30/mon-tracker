import { withApiSession } from '../../../lib/session.js';

async function handler(req, res) {
  req.session.destroy();
  res.json({ success: true });
}
export default withApiSession(handler);
