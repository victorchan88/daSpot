import { Song } from '@components/listeningrooms/Song';
import { withUser } from '@hocs/withUser';
import { db } from '@services/firebase';
import axios from 'axios';
import { AuthAction, withAuthUser } from 'next-firebase-auth';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

/* This renders the Search interface of the application */
class Search extends Component {
  //type enforcing for Search arguments
  static propTypes = {
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
    value: '',
    search: [],
    loading: false,
  };

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
  };

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  //Get Song info of tracks already requested
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

  handleChange = (e) => {
    this.setState((state) => {
      return {
        ...state,
        value: e.target.value,
      };
    });
  };
  //Fetches songs using spotify's search endpoint
  fetchSongs = async (e) => {
    e.preventDefault();

    if (this.state.value.trim() === '') {
      this.setState((state) => {
        return {
          ...state,
          search: [],
        };
      });

      return;
    }

    this.setState((state) => {
      return {
        ...state,
        search: [],
        loading: true,
      };
    });

    try {
      const token = await this.props.user.getIdToken();
      const { data } = await axios({
        headers: {
          authorization: token,
        },
        url: `/api/search?name=${this.state.value}`,
      });

      this.setState((state) => {
        return {
          ...state,
          search: data,
        };
      });
    } catch (err) {
      console.error(err);
    }

    this.setState((state) => {
      return {
        ...state,
        loading: false,
      };
    });
  };

  render = () => {
    return (
      <div>
        <form
          onSubmit={this.fetchSongs}
          className='d-flex flex-column align-items-center justify-content-center mt-5'
        >
          {/* Search bar for songs */}
          <label className='mb-3 w-100'>
            <Col xs={12} md={9} lg={6} className='mx-auto'>
              <span className='h6 text-uppercase text-info'>Search:</span>
              <div className='d-flex'>
                <input
                  className='form-control'
                  onChange={this.handleChange}
                  name='value'
                  type='text'
                  value={this.state.value}
                />
                <Button
                  type='submit'
                  variant='outline-secondary'
                  className='d-flex flex-shrink-0 ml-2'
                >
                  get songs
                </Button>
              </div>
            </Col>
          </label>
        </form>

        {this.state.loading && (
          <div
            className='mt-5 mx-auto d-block spinner-border text-primary'
            role='status'
          >
            <span className='sr-only'>Loading...</span>
          </div>
        )}

        {/* Lists results from the search */}
        {this.state.search.map((info) => (
          <Song
            key={info.id}
            info={info}
            songs={this.state.songs}
            event={this.props.partyid}
            filterexplicit={this.props.filterexplicit}
          />
        ))}
      </div>
    );
  };
}

const WrappedSearch = withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(withUser(withRouter(Search)));

export { WrappedSearch as Search };
