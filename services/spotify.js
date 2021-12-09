import axios from 'axios';
import querystring from 'querystring';

/* Establishes Requests to Spotify API using axios */
export class SpotifyAPI {
  spotifyPair = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  apiKey = Buffer.from(this.spotifyPair).toString('base64');

  getAccessToken = async () => {
    try {
      const { data } = await axios({
        data: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
        }),
        headers: {
          Authorization: `Basic ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        url: 'https://accounts.spotify.com/api/token',
      });

      return data;
    } catch (err) {
      console.error(err);
    }
  };

  search = async (query) => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const { access_token } = await this.getAccessToken();

      const { data } = await axios({
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        url: `https://api.spotify.com/v1/search?type=track&q=${encodedQuery}`,
      });

      return data;
    } catch (err) {
      console.error(err);
    }
  };

  getTrack = async (query) => {
    try {
      const { access_token } = await this.getAccessToken();

      const { data } = await axios({
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        url: `https://api.spotify.com/v1/tracks?ids=${query}`,
      });

      return data;
    } catch (err) {
      console.error(err);
    }
  };
}
