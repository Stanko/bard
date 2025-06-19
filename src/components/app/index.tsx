import Controls from '../controls';
import Footer from '../footer';
import Header from '../header';
import Poem from '../poem';
import './index.css';

type AppProps = {
  addGoatCounter?: boolean;
};

const App = ({ addGoatCounter = false }: AppProps) => {
  return (
    <>
      <main className="app">
        <Header />
        <Controls />
        <Poem />
      </main>
      <Footer />

      {(addGoatCounter || import.meta.env.MODE === 'production') && (
        <script
          data-goatcounter="https://muffinman_io.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
        />
      )}
    </>
  );
};

export default App;
