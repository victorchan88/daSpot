import { NavMenu } from '@components/NavMenu';
import { LandingImage } from '@components/svg/LandingImage';
import Link from 'next/link';
import { Component } from 'react';
import Button from 'react-bootstrap/Button';

/*
This is the landing page of the application
 */
class Index extends Component {
  render = () => {
    return (
      <>
        <NavMenu />
        <div className='d-flex align-items-center justify-content-between flex-column flex-lg-row mt-5'>
          <div className='order-lg-2 m-2'>
            <LandingImage className='landing-page-image' />
          </div>
          <div className='m-2'>
            <h1 className='display-1 text-secondary text-center text-lg-left'>
              daSpot
            </h1>
            <h2 className='h4 text-info text-uppercase text-center text-lg-left'>
              <span className='d-flex'>improving your listening </span>
              <span>party experience</span>
            </h2>
            <div className='text-center text-lg-left'>
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

export default Index;
