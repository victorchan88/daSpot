import { auth } from '@services/firebase';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

/* This class handles verification of the One time pin code
used for authorization */
export class OTPCodeVerification extends Component {
  static propTypes = {
    confirmationResult: PropTypes.object.isRequired,
    resendOTPCode: PropTypes.func.isRequired,
    resetVerification: PropTypes.func.isRequired,
    setRecaptcha: PropTypes.func.isRequired,
  };

  recaptchaContainer = createRef();

  state = {
    invalidOTPCode: false,
    userOTPCode: '',
  };
  //initialzes Recaptcha useing Google's SDK
  initializeRecaptcha = async () => {
    const recaptchaVerifier = new auth.RecaptchaVerifier('resendOTPCode', {
      size: 'invisible',
    });

    const recaptchaWidgetId = await recaptchaVerifier.render();

    this.props.setRecaptcha(recaptchaVerifier, recaptchaWidgetId);
  };

  handleChange = (e) => {
    this.setState((state) => {
      return {
        ...state,
        invalidOTPCode: false,
        userOTPCode: e.target.value,
      };
    });
  };

  //confirms that OTP code entered is correct
  handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await this.props.confirmationResult.confirm(this.state.userOTPCode);
    } catch {
      this.setState((state) => {
        return {
          ...state,
          invalidOTPCode: true,
        };
      });
    }
  };

  componentDidMount = () => {
    this.initializeRecaptcha();
  };

  render = () => {
    return (
      <form
        onSubmit={this.handleSubmit}
        className='d-flex flex-column align-items-center min-vh-100 justify-content-center'
      >
        {this.state.invalidRecaptcha && (
          <Alert variant='danger' role='alert'>
            Please enter the code we sent to your device
          </Alert>
        )}

        <label className='mb-3 w-100'>
          <Col xs={12} md={9} lg={6} className='mx-auto'>
            <span className='h6 text-uppercase text-info'>
              One-Time Pin code:
            </span>
            <input
              autoComplete='one-time-code'
              className='form-control'
              inputMode='numeric'
              onChange={this.handleChange}
              name='userOTPCode'
              type='text'
              value={this.state.userOTPCode}
            />{' '}
            {/* OTP Pin stored as state and updated in this.handleChange*/}
            <small>Enter the 6-digit code we sent to your device</small>
          </Col>
        </label>
        <div className='button-row'>
          <Button variant='outline-primary' type='submit' className='mb-2 mx-1'>
            submit
          </Button>
          <Button
            className='mb-2 mx-1'
            variant='outline-secondary'
            type='button'
            onClick={this.props.resetVerification}
          >
            reset
          </Button>
          {/* Clicking resets verification process*/}
          <Button
            className='mb-2 mx-1'
            variant='outline-success'
            id='resendOTPCode'
            type='button'
            onClick={this.props.resendOTPCode}
          >
            resend code
          </Button>
          {/* Clicking resends the same code*/}
        </div>
      </form>
    );
  };
}
