import { Downvote } from '@components/svg/Downvote';
import { Remove } from '@components/svg/Remove';
import { Upvote } from '@components/svg/Upvote';
import { withUser } from '@hocs/withUser';
import { db, firestore } from '@services/firebase';
import { withAuthUser } from 'next-firebase-auth';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { Flipped } from 'react-flip-toolkit';

/*
The component to represent all information about a specific song.
*/
class Song extends Component {
  static propTypes = {
    isHost: PropTypes.bool,
    songs: PropTypes.array,
    event: PropTypes.string,
    info: PropTypes.shape({
      artists: PropTypes.array,
      id: PropTypes.string,
      image: PropTypes.string,
      name: PropTypes.string,
      explicit: PropTypes.bool,
    }),
    user: PropTypes.shape({
      firebaseUser: PropTypes.shape({
        phoneNumber: PropTypes.string,
      }),
    }),
    filterexplicit: PropTypes.bool,
  };

  /* Adds a vote to the song from the user
  appending their phone number to the Document */
  requestSong = async () => {
    try {
      const document = db.doc(
        `parties/${this.props.event}/queue/${this.props.info.id}`
      );

      const documentRef = await document.get();

      if (documentRef.exists) {
        await document.update({
          votes: firestore.FieldValue.arrayUnion(
            this.props.user.firebaseUser.phoneNumber
          ),
        });
      } else {
        await db
          .collection('parties')
          .doc(this.props.event)
          .collection('queue')
          .doc(this.props.info.id)
          .set({
            votes: [this.props.user.firebaseUser.phoneNumber],
            explicit: this.props.info.explicit,
          });
      }
    } catch (err) {
      console.error('error', err);
    }
  };
  /* Removes the user's request by deleting their phone number from
the Song's votes */
  removeRequest = async () => {
    try {
      const document = db.doc(
        `parties/${this.props.event}/queue/${this.props.info.id}`
      );
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

  removeFromQueue = async () => {
    if (!this.props.isHost) {
      return;
    }

    try {
      const document = db.doc(
        `parties/${this.props.event}/queue/${this.props.info.id}`
      );

      await document.delete();
    } catch (err) {
      console.error('error', err);
    }
  };

  render = () => {
    const requests = this.props.songs.find(
      (song) => song.id === this.props.info.id
    );

    return (
      <Flipped flipId={this.props.info.id}>
        <div className='song-request'>
          <section>
            <img src={this.props.info.image} alt={this.props.info.name} />
          </section>
          <div className='song-request-info'>
            <h1>{this.props.info.name}</h1>
            <h2>{this.props.info.artists.join(', ')}</h2>
            {this.props.info.explicit && (
              <span className='text-center text-sm-left d-block w-100 mb-2 mb-sm-3'>
                <span className='badge badge-secondary'>Explicit</span>
              </span>
            )}
          </div>
          <div>
            <h3 className='mt-2 mt-sm-0'>
              <span className='text-success'>
                {requests?.votes.length || 0}
              </span>{' '}
              request{requests?.votes.length !== 1 && 's'}
            </h3>
            {/* Remove button to request song if it is filtered by clean mode */}

            <div
              className={`song-request-actions ${
                this.props.isHost ? 'is-host' : ''
              }`}
            >
              {requests?.votes.includes(
                this.props.user?.firebaseUser?.phoneNumber
              ) ? (
                <Button onClick={this.removeRequest} variant='outline-danger'>
                  <Downvote />
                </Button>
              ) : (
                <>
                  {(!this.props.filterexplicit ||
                    (this.props.filterexplicit &&
                      !this.props.info.explicit)) && (
                    <Button
                      onClick={this.requestSong}
                      variant='outline-success'
                    >
                      <Upvote />
                    </Button>
                  )}
                </>
              )}
              {this.props.isHost && (
                <Button onClick={this.removeFromQueue} variant='outline-dark'>
                  <Remove />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Flipped>
    );
  };
}

const WrappedSong = withAuthUser()(withUser(Song));
export { WrappedSong as Song };
