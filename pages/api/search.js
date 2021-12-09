import { SpotifyAPI } from '@services/spotify';

/* This sends a search query to spotify and recieves a list of tracks and
their relevant information. The handler filters the necessary information and
returns the result   */
class RequestHandler {
  spotify = new SpotifyAPI();

  get = async (req, res) => {
    if (!req.headers?.authorization) {
      return res.status(400).json({ error: 'Missing Authorization header' });
    }

    try {
      const { tracks } = await this.spotify.search(req.query.name);

      const result = tracks.items.map((track) => {
        return {
          artists: track.artists.map((artist) => artist.name),
          id: track.id,
          image: track.album.images[0].url,
          name: track.name,
          explicit: track.explicit,
        };
      });

      return res.json(result);
    } catch (err) {
      console.error(err);

      return res.send(500);
    }
  };
}

const handler = async (req, res) => {
  const requestHandler = new RequestHandler();

  switch (req.method) {
    case 'GET':
      return requestHandler.get(req, res);
    default:
      return res.status(405);
  }
};

export default handler;
