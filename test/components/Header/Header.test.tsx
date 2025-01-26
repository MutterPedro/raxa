import { render } from '@testing-library/react';

import Header from '../../../src/components/header/Header';

describe('Header.tsx', function () {
  describe('Sanity tests', function () {
    it('should exist #sanity', function () {
      expect(Header).not.toBeFalsy();
    });

    it('should render correctly #sanity', function () {
      const tree = render(<Header />).asFragment();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Unit tests', function () {
    it('should have the login button #unit', function () {
      const result = render(<Header />);
      expect(result.getAllByText('Log in')[0]).toBeInTheDocument();
    });

    it('should have the home button #unit', function () {
      const result = render(<Header />);
      expect(result.getAllByText('RAXA')[0]).toBeInTheDocument();
    });
  });
});
