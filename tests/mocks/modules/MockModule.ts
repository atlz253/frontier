import { classBuilder } from "../../../src";

export class MockModule {
  props;

  constructor(props) {
    this.props = props;
  }
}

export const mockModule = classBuilder(MockModule);
