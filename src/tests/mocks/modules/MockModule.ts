import { classBuilder } from "../../..";

export class MockModule<T = {}> {
  props;

  constructor(props: T) {
    this.props = props;
  }
}

export const mockModule = classBuilder(MockModule);
