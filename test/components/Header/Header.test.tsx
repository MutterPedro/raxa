import { create } from 'react-test-renderer';

import Header from '../../../src/components/header/Header';

describe('Header.tsx', function () {
  describe('Sanity tests', function () {
    it('should exist #sanity', function () {
      expect(Header).not.toBeFalsy();
    });

    it('should render correctly #sanity', function () {
      const tree = create(<Header />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
