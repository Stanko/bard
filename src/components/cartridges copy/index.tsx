import clsx from 'clsx';
import { datasets } from '../../lib/options';
import { useOptionsStore } from '../../stores/options';
import './index.css';

type CartridgeProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const Cartridge = ({ className = '', ...props }: CartridgeProps) => {
  const options = useOptionsStore((state) => state.options);
  const dataset = datasets.find((d) => d.name === options.dataset);

  return (
    <div {...props} className={clsx('cartridge', className, dataset?.theme)}>
      <svg
        shapeRendering="crispEdges"
        viewBox="0 0 64 14"
        className="cartridge__bg"
        key={options.dataset}
      >
        <use href="#px-cartridge-bg" />
      </svg>
    </div>
  );
};

export default Cartridge;
