import { initAuth } from '@services/firebase';
import { setAuthCookies } from 'next-firebase-auth';

/* Handles login of user to Firebase */
class RequestHandler {
  constructor() {
    initAuth();
  }

  post = async (req, res) => {
    try {
      await setAuthCookies(req, res);
    } catch (err) {
      console.error(err);

      return res
        .status(500)
        .send({ error: "Couldn't set authorization cookies" });
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
