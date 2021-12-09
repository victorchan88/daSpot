import { withUser } from '@hocs/withUser';
import { withAuthUser } from 'next-firebase-auth';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';

/* This Navigation bar holds the brand logo and sign in button.
These Nav components are provided by the React bootstrap library. */
class NavMenu extends Component {
  // Type enforcement of the NavMenu arguments
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      signOut: PropTypes.func,
    }),
  };

  render = () => {
    return (
      <Navbar>
        <Navbar.Brand>
          <Link href='/'>
            <a className='h1 text-secondary'>daSpot</a>
          </Link>
        </Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse className='justify-content-end'>
          {this.props.user.id ? (
            <>
              <Button
                variant='outline-primary'
                onClick={this.props.user.signOut}
              >
                sign out
              </Button>
            </>
          ) : (
            <Link href='/login' passHref>
              <Button as='a' variant='outline-primary'>
                sign in
              </Button>
            </Link>
          )}
        </Navbar.Collapse>
      </Navbar>
    );
  };
}

const WrappedNavMenu = withAuthUser()(withUser(NavMenu));
export { WrappedNavMenu as NavMenu };
