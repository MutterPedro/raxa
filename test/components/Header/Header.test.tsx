import { render } from '@testing-library/react';

import Header from '../../../src/components/header/Header';
import { ServicesProvider } from '../../../src/components/state/ServicesProvider';

describe('Header.tsx', function () {
  describe('Sanity tests', function () {
    it('should exist #sanity', function () {
      expect(Header).not.toBeFalsy();
    });

    it('should render correctly #sanity', function () {
      const tree = render(
        <ServicesProvider>
          <Header />
        </ServicesProvider>,
      ).asFragment();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Unit tests', function () {
    it('should have the login button #unit', function () {
      const result = render(
        <ServicesProvider>
          <Header />
        </ServicesProvider>,
      );
      expect(result.getAllByText('Log in')[0]).toBeInTheDocument();
    });

    it('should have the home button #unit', function () {
      const result = render(
        <ServicesProvider>
          <Header />
        </ServicesProvider>,
      );
      expect(result.getAllByText('RAXA')[0]).toBeInTheDocument();
    });
  });
});
