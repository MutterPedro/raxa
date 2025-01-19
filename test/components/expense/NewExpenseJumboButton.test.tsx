import { create } from 'react-test-renderer';
import NewBillJumboButton from '../../../src/components/expense/NewExpenseJumboButton';

describe('NewExpenseJumboButton.tsx', function () {
  describe('Sanity tests', function () {
    it('should exists #sanity', function () {
      expect(NewBillJumboButton).not.toBeFalsy();
    });

    it('should render correctly #sanity', function () {
      const tree = create(<NewBillJumboButton handleOnClick={() => {}} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Unit tests', function () {});
});
