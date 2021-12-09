import { initAuth } from '@services/firebase';
import { unsetAuthCookies } from 'next-firebase-auth';

/* Handles logout of user to Firebase */
class RequestHandler {
  constructor() {
    initAuth();
  }

  post = async (req, res) => {
    try {
      await unsetAuthCookies(req, res);
    } catch (err) {
      console.error(err);

      return res
        .status(500)
        .send({ error: "Couldn't unset authorization cookies" });
    }

    return res.json({ success: true });
  };
}

const handler = async (req, res) => {
  const requestHandler = new RequestHandler();

  switch (req.method) {
    case 'POST':
      return requestHandler.post(req, res);
    default:
      return res.status(405);
  }
};

export default handler;
