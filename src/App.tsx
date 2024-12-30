import Header from './components/header/Header';
import MainContainer from './components/MainContainer';

function App() {
  return (
    <>
      <Header />
      <main className="flex justify-center min-h-svh py-10 px-6">
        <MainContainer />
      </main>
    </>
  );
}

export default App;
