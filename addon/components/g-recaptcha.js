import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { assign } from '@ember/polyfills';
import Configuration from '../configuration';

export default class GRecaptcha extends Component {

  sitekey = Configuration.siteKey

  renderReCaptcha() {
    let properties = this.getProperties(
      'sitekey',
      'theme',
      'type',
      'size',
      'tabindex',
      'hl',
      'badge'
    );
    let parameters = assign(properties, {
      callback: this.successCallback.bind(this),
      'expired-callback': this.expiredCallback.bind(this),
    });
    let widgetId = window.grecaptcha.render(this.element, parameters);
    this.widgetId = widgetId;
    this.ref = this;
    this.renderCallback()
  }

  resetReCaptcha() {
    if (isPresent(this.widgetId)) {
      window.grecaptcha.reset(this.widgetId);
    }
  }

  renderCallback() {
    let action = this.onRender;
    if (isPresent(action)) {
      action();
    }
  }

  successCallback(reCaptchaResponse) {
    let action = this.onSuccess;
    if (isPresent(action)) {
      action(reCaptchaResponse);
    }
  }

  expiredCallback() {
    let action = this.onExpired;
    if (isPresent(action)) {
      action();
    } else {
      this.resetReCaptcha();
    }
  }

  appendScript(src) {
    let scriptTag = document.createElement('script');
    scriptTag.src = src;
    document.body.appendChild(scriptTag);
  }

  // Lifecycle Hooks

  didInsertElement() {
    window.__ember_g_recaptcha_onload_callback = () => { this.renderReCaptcha(); };
    let baseUrl = Configuration.jsUrl || 'https://www.google.com/recaptcha/api.js?render=explicit';
    this.appendScript(`${baseUrl}&onload=__ember_g_recaptcha_onload_callback`)
  }

}
