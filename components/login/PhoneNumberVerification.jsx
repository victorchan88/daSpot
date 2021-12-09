/* global grecaptcha */

import { auth } from '@services/firebase';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

/* This class handles Phone Number Verification.
The main functionality is provided by Firebase*/
export class PhoneNumberVerification extends Component {
  static propTypes = {
    invalidPhoneNumber: PropTypes.bool.isRequired,
    recaptchaWidgetId: PropTypes.number,
    resetPhoneNumberValidation: PropTypes.func.isRequired,
    sendUserOTPCode: PropTypes.func.isRequired,
    setRecaptcha: PropTypes.func.isRequired,
  };

  //reference to DOM element of recaptcha container
  recaptchaContainer = createRef();

  state = {
    invalidRecaptcha: false,
    userPhoneNumber: '',
    verifiedRecaptcha: false,
  };

  //sets function to carry out recaptcha verification
  initializeRecaptcha = async () => {
    const recaptchaVerifier = new auth.RecaptchaVerifier(
      this.recaptchaContainer.current,
      {
        size: 'normal',
        callback: (_) => {
          this.setState((state) => {
            return {
              ...state,
              invalidRecaptcha: false,
              verifiedRecaptcha: true,
            };
          });
        },
        'expired-callback': (_) => {
          this.setState((state) => {
            return {
              ...state,
              verifiedRecaptcha: false,
            };
          });

          grecaptcha.reset(this.props.recaptchaWidgetId);
        },
      }
    );

    const recaptchaWidgetId = await recaptchaVerifier.render();

    this.props.setRecaptcha(recaptchaVerifier, recaptchaWidgetId);
  };

  resetVerification = () => {
    this.setState((state) => {
      return {
        ...state,
        invalidRecaptcha: false,
        userPhoneNumber: '',
        verifiedRecaptcha: false,
      };
    });

    this.props.resetPhoneNumberValidation();
  };

  handleChange = (e) => {
    this.setState((state) => {
      return {
        ...state,
        invalidRecaptcha: false,
        userPhoneNumber: e.target.value,
      };
    });

    this.props.resetPhoneNumberValidation();
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    if (this.state.verifiedRecaptcha) {
      this.props.sendUserOTPCode(this.state.userPhoneNumber);
    } else {
      this.setState((state) => {
        return {
          ...state,
          invalidRecaptcha: true,
        };
      });

      grecaptcha.reset(this.props.recaptchaWidgetId);
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
            Please complete the reCAPTCHA below
          </Alert>
        )}
        {this.props.invalidPhoneNumber && (
          <Alert variant='danger' role='alert'>
            Please enter a valid phone number
          </Alert>
        )}

        <label className='mb-3 w-100'>
          {/* Phone Number stored as state and updated in this.handleChange*/}
          <Col xs={12} md={9} lg={6} className='mx-auto'>
            <span className='h6 text-uppercase text-info'>Phone number:</span>
            <input
              className='form-control'
              onChange={this.handleChange}
              name='userPhoneNumber'
              type='tel'
              value={this.state.userPhoneNumber}
            />
            <small>Phone number format: 1234567890</small>
          </Col>{' '}
        </label>
        {/* Recaptcha inserted into this container upon render*/}
        <div ref={this.recaptchaContainer} className='mb-3' />

        <div className='button-row'>
          <Button variant='outline-primary' type='submit' className='mb-2 mx-1'>
            submit
          </Button>
          <Button
            className='mb-2 mx-1'
            variant='outline-secondary'
            type='button'
            onClick={this.resetVerification}
          >
            reset
          </Button>
        </div>
      </form>
    );
  };
}
