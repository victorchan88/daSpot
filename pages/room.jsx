import { Requests } from '@components/listeningrooms/Requests';
import { Search } from '@components/listeningrooms/Search';
import { NavMenu } from '@components/NavMenu';
import { withUser } from '@hocs/withUser';
import { db } from '@services/firebase';
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import QRCode from 'react-qr-code';

export const getServerSideProps = withAuthUserTokenSSR({})();

/* 
This is the main component that serves as an interface
of the listening room.

From this single page tabs can be selected
for Party Info, Requests and Search


*/
class Room extends Component {
  static propTypes = {
    router: PropTypes.shape({
      query: PropTypes.shape({
        code: PropTypes.string,
      }).isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      signOut: PropTypes.func,
    }).isRequired,
  };

  copyToClipboard = createRef();

  state = {
    showCopyToClipboardTooltip: false,
    deleteListener: null,
    partyid: this.props.router.query?.code,
    isHost: false,
    tab: 1,
    value: '',
    invalidSearchId: false,
    qrCodeLink: undefined,
    filterexplicit: false,
    loaded: false,
  };

  handleChange = (e) => {
    this.setState((state) => {
      return {
        ...state,
        value: e.target.value,
        invalidSearchId: false,
      };
    });
  };

  /* Initializes Listening Room in Firebase Realstore
    Sets the hosts auth id for permissions and Host UI
  */
  createRoom = () => {
    //adds new document to Firestore
    db.collection('parties')
      .add({
        created: new Date(),
        host: this.props.user.id,
        filterexplicit: false,
      })
      .then((docRef) => {
        this.setState((state) => {
          return {
            ...state,
            partyid: docRef.id,
            isHost: true,
          };
        });

        this.props.router.push({
          pathname: '/room',
          query: {
            code: docRef.id,
          },
        });
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  };

  /*  Enters guest into a listening and gives them read and write access
  to the Queue */
  enterRoom = async (e) => {
    e.preventDefault();

    if (!this.state.value.trim()) {
      this.leaveParty();

      this.setState((state) => {
        return {
          ...state,
          invalidSearchId: true,
        };
      });

      return;
    }
    let docRef = db.collection('parties').doc(this.state.value);

    //reads document from Firestore to update the State
    docRef.get().then((doc) => {
      if (doc.exists) {
        const deleteListener = docRef.onSnapshot((doc) => {
          if (!doc.exists) {
            this.leaveParty();
          }
        });

        const filterexplicitListener = docRef.onSnapshot((doc) => {
          this.setState((state) => {
            return {
              ...state,
              filterexplicit: doc.data().filterexplicit,
            };
          });
        });

        if (doc.data().host === this.props.user.id) {
          this.setState((state) => {
            return {
              ...state,
              isHost: true,
            };
          });
        } else {
          this.setState((state) => {
            return {
              ...state,
              filterexplicitListener,
            };
          });
        }

        /*listeners use Web Sockets to provide live updates
            of the database*/
        this.setState((state) => ({
          ...state,
          deleteListener,
          partyid: this.state.value,
          joiningParty: false,
          qrCodeLink: window.location.href,
          filterexplicit: doc.data().filterexplicit,
        }));

        this.props.router.push({
          pathname: '/room',
          query: {
            code: docRef.id,
          },
        });
      } else {
        // doc.data() will be undefined in this case
        this.leaveParty();

        this.setState((state) => {
          return {
            ...state,
            invalidSearchId: true,
          };
        });
      }
    });
  };

  endParty = () => {
    this.props.router.push({
      pathname: '/room',
      query: {},
    });

    this.state.deleteListener?.();
    this.state.filterexplicitListener?.();

    db.collection('parties')
      .doc(this.state.partyid)
      .delete()
      .then(() => {
        this.setState((state) => ({ ...state, partyid: null, isHost: false }));
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  };

  //copies share url to clipboard
  copyPartyID = () => {
    navigator.clipboard.writeText(
      `${location.href.replace(location.search, '')}?code=${this.state.partyid}`
    );

    this.setState((state) => {
      return {
        ...state,
        showCopyToClipboardTooltip: true,
      };
    });

    setTimeout(() => {
      this.setState((state) => {
        return {
          ...state,
          showCopyToClipboardTooltip: false,
        };
      });
    }, 3000);
  };

  //Allows the guest to leave the party
  leaveParty = () => {
    this.state.deleteListener?.();
    this.state.filterexplicitListener?.();

    this.props.router.push({
      pathname: '/room',
      query: {},
    });

    this.setState((state) => {
      return {
        ...state,
        partyid: false,
        isHost: false,
      };
    });
  };

  /*
  Initialzes room when the pages is loaded directly
  */
  componentDidMount = () => {
    this.setState((state) => {
      return {
        ...state,
        loaded: true,
      };
    });

    if (this.state.partyid) {
      let docRef = db.collection('parties').doc(this.state.partyid);

      docRef.get().then((doc) => {
        if (doc.exists) {
          const deleteListener = docRef.onSnapshot((doc) => {
            if (!doc.exists) {
              this.leaveParty();
            }
          });

          const filterexplicitListener = docRef.onSnapshot((doc) => {
            this.setState((state) => {
              return {
                ...state,
                filterexplicit: doc.data().filterexplicit,
              };
            });
          });

          if (doc.data().host === this.props.user.id) {
            this.setState((state) => {
              return {
                ...state,
                isHost: true,
              };
            });
          }
          this.setState((state) => ({
            ...state,
            deleteListener,
            joiningParty: false,
            qrCodeLink: window.location.href,
            filterexplicit: doc.data().filterexplicit,
            filterexplicitListener,
          }));
        } else {
          this.leaveParty();

          this.setState((state) => {
            return {
              ...state,
              invalidSearchId: true,
            };
          });
        }
      });
    }
  };

  componentWillUnmount = () => {
    this.state.deleteListener?.();
    this.state.filterexplicitListener?.();
  };

  /* This function allows the host to toggle Clean Mode for the party.
  It will update the value from Firestore*/
  toggleExplicit = async () => {
    let docRef = db.collection('parties').doc(this.state.partyid);

    docRef.get().then((doc) => {
      const oldFilter = doc.data().filterexplicit;
      docRef
        .update({
          filterexplicit: !oldFilter,
        })
        .then(() => {
          this.setState((state) => {
            return {
              ...state,
              filterexplicit: !oldFilter,
            };
          });
        });
    });
  };

  render = () => {
    return (
      <>
        <NavMenu />{' '}
        {/* If user is in the party it will display information else
         reroute them to create or join a party */}
        {this.state.partyid ? (
          <>
            <Nav
              variant='tabs'
              defaultActiveKey='info'
              className='text-uppercase font-weight-bold small'
            >
              {/*Nav will toggle between tabs */}
              <Nav.Item>
                <Nav.Link
                  active={this.state.tab === 1}
                  onClick={() =>
                    this.setState((state) => ({ ...state, tab: 1 }))
                  }
                >
                  Info
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  onClick={() =>
                    this.setState((state) => ({ ...state, tab: 2 }))
                  }
                  active={this.state.tab === 2}
                >
                  Requests
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={this.state.tab === 3}
                  onClick={() =>
                    this.setState((state) => ({ ...state, tab: 3 }))
                  }
                >
                  Search
                </Nav.Link>
              </Nav.Item>
            </Nav>
            {this.state.isHost && (
              <div className='explictMode'>
                {/* Clean mode button only appers for host */}
                <span>Clean Mode</span>
                <label className='switch'>
                  <input
                    className='cleanCheck'
                    onChange={this.toggleExplicit}
                    type='checkbox'
                    checked={this.state.filterexplicit}
                  />
                  <span className='slider round'></span>
                </label>
              </div>
            )}

            {(this.state.tab === 1 && (
              <div className='mt-5 text-center'>
                <div className='p-3 bg-secondary d-inline-block mb-4 rounded'>
                  {typeof window !== 'undefined' && this.state.loaded && (
                    <QRCode
                      bgColor='#e5e7eb'
                      fgColor='#18181b'
                      size={200}
                      value={window.location.href}
                    />
                  )}
                </div>
                <h3 className='text-break mb-4'>{this.state.partyid}</h3>
                <Button
                  className='mx-2'
                  ref={this.copyToClipboard}
                  onClick={this.copyPartyID}
                  variant='outline-primary'
                >
                  Share party
                </Button>
                <Overlay
                  target={this.copyToClipboard.current}
                  show={this.state.showCopyToClipboardTooltip}
                  placement='bottom'
                >
                  <Tooltip>Link copied to clipboard</Tooltip>
                </Overlay>
                {/* Host sees option to end the party
                  while guest sees option to leave the party */}
                {this.state.isHost ? (
                  <Button
                    className='mx-2'
                    onClick={this.endParty}
                    variant='outline-danger'
                  >
                    End Party
                  </Button>
                ) : (
                  <Button
                    className='mx-2'
                    onClick={this.leaveParty}
                    variant='outline-danger'
                  >
                    Leave Party
                  </Button>
                )}
              </div>
            )) ||
              (this.state.tab === 2 && (
                <Requests
                  filterexplicit={this.state.filterexplicit}
                  partyid={this.state.partyid}
                  isHost={this.state.isHost}
                />
              )) ||
              (this.state.tab === 3 && (
                <Search
                  filterexplicit={this.state.filterexplicit}
                  partyid={this.state.partyid}
                />
              ))}
          </>
        ) : (
          <>
            {this.state.joiningParty ? (
              <form
                onSubmit={this.enterRoom}
                className='d-flex flex-column align-items-center justify-content-center mt-5'
              >
                {this.state.invalidSearchId && (
                  <Alert variant='danger' role='alert'>
                    Please enter a valid Search ID
                  </Alert>
                )}
                <label className='mb-3 w-100'>
                  <Col xs={12} md={9} lg={6} className='mx-auto'>
                    <span className='h6 text-uppercase text-info'>
                      Search code:
                    </span>
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
                        variant='outline-primary'
                        className='d-flex flex-shrink-0 ml-2'
                      >
                        join room
                      </Button>
                    </div>

                    <Button
                      type='submit'
                      variant='outline-secondary'
                      className='d-flex flex-shrink-0 mt-2 mx-auto'
                      onClick={() =>
                        this.setState((state) => ({
                          ...state,
                          joiningParty: false,
                        }))
                      }
                    >
                      return to menu
                    </Button>
                  </Col>
                </label>
              </form>
            ) : (
              <div className='mt-5 text-center'>
                {/*If the user is not in an active party
              they'll have to join one */}
                <Button
                  className='mx-2 my-1'
                  onClick={this.createRoom}
                  variant='outline-primary'
                >
                  Create Party
                </Button>
                <Button
                  className='mx-2 my-1'
                  onClick={() =>
                    this.setState((state) => ({ ...state, joiningParty: true }))
                  }
                  variant='outline-light'
                >
                  Join a Party
                </Button>
              </div>
            )}
          </>
        )}
      </>
    );
  };
}

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(withUser(withRouter(Room)));
