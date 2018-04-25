import PropTypes from 'prop-types';
import React from 'react';

class Confirmation extends React.Component {
  constructor(props) {
    super(props);
    this.state = { status: 'Confirming, please wait.' };
  }

  componentWillMount() {
    const { confirmationId } = this.props.match.params;
    if (confirmationId.length !== 36) {
      this.setState({ status: 'invalid confirmation id' });
      return;
    }
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user_confirm/${confirmationId}`)
      .then(response => response.json().then(body => ({ body, status: response.status })))
      .then(({ body }) => {
        this.setState({ status: body.message });
      })
      .catch((error) => {
        this.setState({ status: '(error) see console for info' });
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <h1>Account Creation Confirmation</h1>
        {this.state.status}
      </div>
    );
  }
}
Confirmation.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      confirmationId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};
export default Confirmation;
