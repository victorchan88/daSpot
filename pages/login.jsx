/* global grecaptcha */

import {
  OTPCodeVerification,
  PhoneNumberVerification,
} from '@components/login';
import { auth } from '@services/firebase';
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth';
import { Component } from 'react';

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})();

/* This component perfoms all necessary operations of login
using the Firebase SDK */
class Login extends Component {
  state = {
    confirmationResult: null,
    invalidPhoneNumber: false,
    recaptchaVerifier: null,
    recaptchaWidgetId: null,
    userPhoneNumber: '',
    verifiedUserPhoneNumber: false,
  };

  resendOTPCode = () => {
    this.sendUserOTPCode(this.state.userPhoneNumber);
  };

  resetPhoneNumberValidation = () => {
    this.setState((state) => {
      return {
        ...state,
        invalidPhoneNumber: false,
      };
    });
  };

  resetVerification = () => {
    this.setState((state) => {
      return {
        ...state,
        invalidPhoneNumber: false,
        verifiedUserPhoneNumber: false,
      };
    });
  };

  sendUserOTPCode = async (userPhoneNumber) => {
    try {
      const confirmationResult = await auth().signInWithPhoneNumber(
        `+1${userPhoneNumber}`,
        this.state.recaptchaVerifier
      );

      this.setState((state) => {
        return {
          ...state,
          confirmationResult,
          userPhoneNumber,
          verifiedUserPhoneNumber: true,
        };
      });
    } catch {
      this.setState((state) => {
        return {
          ...state,
          invalidPhoneNumber: true,
        };
      });

      grecaptcha.reset(this.state.recaptchaWidgetId);
    }
  };

  setRecaptcha = (recaptchaVerifier, recaptchaWidgetId) => {
    this.setState((state) => {
      return {
        ...state,
        recaptchaVerifier,
        recaptchaWidgetId,
      };
    });
  };

  render = () => {
    /*
      After phone number is verified it will advance to 
      OTP Code Verification
    */
    if (!this.state.verifiedUserPhoneNumber) {
      return (
        <PhoneNumberVerification
          invalidPhoneNumber={this.state.invalidPhoneNumber}
          recaptchaWidgetId={this.state.recaptchaWidgetId}
          resetPhoneNumberValidation={this.resetPhoneNumberValidation}
          sendUserOTPCode={this.sendUserOTPCode}
          storeRecaptchaVerifier={this.storeRecaptchaVerifier}
          setRecaptcha={this.setRecaptcha}
        />
      );
    } else {
      return (
        <OTPCodeVerification
          confirmationResult={this.state.confirmationResult}
          resendOTPCode={this.resendOTPCode}
          resetVerification={this.resetVerification}
          setRecaptcha={this.setRecaptcha}
        />
      );
    }
  };
}

export default withAuthUser({ whenAuthed: AuthAction.REDIRECT_TO_APP })(Login);
