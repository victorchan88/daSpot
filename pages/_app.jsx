import { initAuth } from '@services/firebase';
import '@styles/main.scss';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import { RecoilRoot } from 'recoil';
import Head from 'next/head';

initAuth(); //initializes connection to Firebase at App level.

const App = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <Container>
        <Head>
          <title>daSpot</title>
        </Head>
        <Component {...pageProps} />
      </Container>
    </RecoilRoot>
  );
};

App.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
};

export default App;
