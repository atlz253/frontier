export class MockModule {
  props;

  constructor(props) {
    this.props = props;
  }
}

export const mockModule = (props) => new MockModule(props);
