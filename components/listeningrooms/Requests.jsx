import { Song } from '@components/listeningrooms/Song';
import { withUser } from '@hocs/withUser';
import { db, firestore } from '@services/firebase';
import axios from 'axios';
import { AuthAction, withAuthUser } from 'next-firebase-auth';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { Flipper } from 'react-flip-toolkit';

class Requests extends Component {
  //Typing enforcing Request arguments
  static propTypes = {
    isHost: PropTypes.bool.isRequired,
    partyid: PropTypes.string,
    user: PropTypes.shape({
      getIdToken: PropTypes.func,
      signOut: PropTypes.func,
      firebaseUser: PropTypes.shape({
        phoneNumber: PropTypes.string,
      }),
    }),
    filterexplicit: PropTypes.bool,
  };

  unsubscribe;
  state = {
    songs: [],
    search: [],
    loading: true,
  };

  /*
  On component mount grab the songs ids and votes.
  Votes are stored as phone numbers which serve
  as unique ids to counter duplicate votes
  */
  componentDidMount = () => {
    this.unsubscribe = db
      .collection('parties')
      .doc(this.props.partyid)
      .collection('queue')
      .onSnapshot((docs) => {
        const documents = [];

        docs.forEach((song) => {
          documents.push({ id: song.id, votes: song.data().votes });
        });

        const ids = documents.map((doc) => doc.id);

        this.getRequests(ids, documents);
      });

    this.setState((state) => {
      return {
        ...state,
        loading: false,
      };
    });
  };

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  /* Fetches track information from the Spotify API */
  getRequests = async (ids, documents) => {
    try {
      const token = await this.props.user.getIdToken();
      const { data } = await axios({
        headers: {
          authorization: token,
        },
        url: `/api/track?ids=${ids.join(',')}`,
      });

      const songs = data.map((info, i) => {
        return {
          ...info,
          ...documents[i],
        };
      });

      this.setState((state) => {
        return {
          ...state,
          songs,
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* Removes the user's vote from the Song in the queue.
   Updates the queue in Firestore than propogates the changes
   to the React State */
  removeRequest = async (id) => {
    try {
      const document = db.doc(`parties/${this.props.partyid}/queue/${id}`);
      const documentRef = await document.get();

      if (documentRef.exists) {
        await document.update({
          votes: firestore.FieldValue.arrayRemove(
            this.props.user.firebaseUser.phoneNumber
          ),
        });
      }
    } catch (err) {
      console.error('error', err);
    }
  };

  getSortedQueue = () => {
    const queue = [...this.state.songs];

    queue.sort((song1, song2) => {
      if (song1.votes.length < song2.votes.length) return 1;
      if (song1.votes.length > song2.votes.length) return -1;

      if (song1.name > song2.name) return 1;
      if (song1.name < song2.name) return -1;

      if (song1.artists.join(', ') > song2.artists.join(', ')) return 1;
      if (song1.artists.join(', ') < song2.artists.join(', ')) return -1;
    });

    return queue.filter(
      (song) =>
        song.votes.length > 0 &&
        (!this.props.filterexplicit ||
          (this.props.filterexplicit && song.explicit == false))
    );
  };

  render = () => {
    if (this.state.loading) {
      return (
        <div
          className='mt-5 mx-auto d-block spinner-border text-primary'
          role='status'
        >
          <span className='sr-only'>Loading...</span>
        </div>
      );
    }

    /*Filter songs with no votes and 
    filter by explicit mode*/
    const queue = this.getSortedQueue();

    return (
      <div className='mt-5'>
        {queue.length === 0 && (
          <h1 className='text-info text-uppercase text-center h5'>
            make some requests on the search tab
          </h1>
        )}

        <Flipper flipKey={queue.map((song) => song.id).join()}>
          {queue.map((info) => (
            <Fragment key={info.id}>
              {info.votes.length !== 0 && (
                <Song
                  info={info}
                  songs={this.state.songs}
                  event={this.props.partyid}
                  isHost={this.props.isHost}
                />
              )}
            </Fragment>
          ))}
        </Flipper>
      </div>
    );
  };
}

const WrappedRequests = withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(withUser(withRouter(Requests)));

export { WrappedRequests as Requests };
