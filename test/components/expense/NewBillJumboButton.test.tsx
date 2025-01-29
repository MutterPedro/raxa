import { render } from '@testing-library/react';

import NewBillJumboButton from '../../../src/components/expense/NewBillJumboButton';

describe('NewBillJumboButton.tsx', function () {
  describe('Sanity tests', function () {
    it('should exists #sanity', function () {
      expect(NewBillJumboButton).not.toBeFalsy();
    });

    it('should render correctly #sanity', function () {
      const tree = render(<NewBillJumboButton handleOnClick={() => {}} />).asFragment();
      expect(tree).toMatchSnapshot();
    });
  });
});
