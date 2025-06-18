import Controls from '../controls';
import Footer from '../footer';
import Header from '../header';
import Poem from '../poem';
import './index.css';

const App = () => {
  return (
    <>
      <main className="app">
        <Header />
        <Controls />
        <Poem />
      </main>
      <Footer />
    </>
  );
};

export default App;
