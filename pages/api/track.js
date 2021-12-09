import { SpotifyAPI } from '@services/spotify';
/* The track endpoint returns the track information given a
list of track ids already known. Relevant information is filtered and returned. */
class RequestHandler {
  spotify = new SpotifyAPI();

  get = async (req, res) => {
    if (!req.headers?.authorization) {
      return res.status(400).json({ error: 'Missing Authorization header' });
    }

    if (!req.query.ids) {
      return res.json([]);
    }

    try {
      const { tracks } = await this.spotify.getTrack(req.query.ids);

      const result = tracks.map((track) => {
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
