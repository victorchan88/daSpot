import { NavMenu } from '@components/NavMenu';
import { NotFoundImage } from '@components/svg/NotFoundImage';
import Link from 'next/link';
import { Component } from 'react';
import Button from 'react-bootstrap/Button';

//Static Page to Display 404 error
class NotFound extends Component {
  render = () => {
    return (
      <>
        <NavMenu />
        <div className='d-flex align-items-center justify-content-between flex-column mt-5'>
          <div className='m-2'>
            <NotFoundImage className='landing-page-image' />
          </div>
          <div className='m-2'>
            <h1 className='display-1 text-secondary text-center'>404!</h1>
            <h2 className='h4 text-info text-uppercase text-center'>
              sorry, this page was not found
            </h2>
            <div className='text-center'>
              <Link href='/room' passHref>
                <Button as='a' variant='outline-primary'>
                  Ride the wave
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  };
}

export default NotFound;
