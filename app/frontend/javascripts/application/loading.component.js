import { Component } from 'react';

export default class Loading extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show
    };
  }

  componentDidMount() {
    $(document).on('loading:show', () => this.setState({ show: true }));
    $(document).on('loading:hide', () => this.setState({ show: false }));
  }

  componentWillUnmount() {
    $(document).off('loading:show');
    $(document).off('loading:hide');
  }

  render() {
    if (this.props.show || this.state.show) {
      return (
        <div className="loading-component">
          <span className="fa fa-spinner fa-spin"></span>
          <p>{this.props.text}</p>
        </div>
      )
    }
    return null;
  }
}
