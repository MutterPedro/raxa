import NewExpenseJumboButton from './components/expense/NewExpenseJumboButton';
import Header from './components/header/Header';

function App() {
  return (
    <>
      <Header />
      <main className="flex justify-center min-h-svh py-10 px-6">
        <NewExpenseJumboButton />
      </main>
    </>
  );
}

export default App;
