import { useParams } from 'react-router';

export default function BillDetail() {
  const { billId } = useParams();

  return <h1 style={{ fontWeight: 'bolder', color: '#000' }}>{billId}</h1>;
}
