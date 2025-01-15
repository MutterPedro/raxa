import { create } from 'react-test-renderer';
import NewExpenseJumboButton from '../../../src/components/expense/NewExpenseJumboButton';

describe('NewExpenseJumboButton.tsx', function () {
  describe('Sanity tests', function () {
    it('should exists #sanity', function () {
      expect(NewExpenseJumboButton).not.toBeFalsy();
    });

    it('should render correctly #sanity', function () {
      const tree = create(<NewExpenseJumboButton handleOnClick={() => {}} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Unit tests', function () {});
});
