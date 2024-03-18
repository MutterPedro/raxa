import { render } from '@testing-library/react';

import Header from '../../../src/components/header/Header';

describe('Header.tsx', function () {
  describe('Sanity tests', function () {
    it('should exist #sanity', function () {
      expect(Header).not.toBeFalsy();
    });

    it('should render correctly', function () {
      const result = render(<Header />);
      
    });
  });
});
