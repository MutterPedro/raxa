import Button from '../common/Button';

interface NewBillJumboButtonProps {
  handleOnClick: () => void;
}

export default function NewBillJumboButton({ handleOnClick }: NewBillJumboButtonProps) {
  return (
    <Button type="button" size="lg" onClick={handleOnClick} data-testid="new-bill-jumbo-button" className="px-10">
      Nova conta
    </Button>
  );
}
