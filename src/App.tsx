import { Route, Routes } from 'react-router';
import Header from './components/header/Header';
import MainContainer from './components/MainContainer';
import BillDetail from './components/expense/BillDetail';
import LoginForm from './components/login/LoginForm';

function App() {
  return (
    <>
      <Header />
      <main className="flex justify-center min-h-svh py-10 px-6">
        <Routes>
          <Route index element={<MainContainer />} />
          <Route path="bill/:billId" element={<BillDetail />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
