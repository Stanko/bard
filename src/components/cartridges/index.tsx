import clsx from 'clsx';
import { useEffect, useState } from 'react';
import type { DatasetName } from '../../lib/options';
import { useOptionsStore } from '../../stores/options';
import './index.css';

type CartridgesProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const images: Record<DatasetName, string> = {
  fz: './yellow.gif',
  td: './blue.gif',
  lotr: './green.gif',
  hp: './red.gif',
  shkspr: './blue.gif',
};

const Cartridges = ({ className = '', ...props }: CartridgesProps) => {
  const options = useOptionsStore((state) => state.options);

  const [image, setImage] = useState<string>(
    images[options.dataset as keyof typeof images] + '?cache=' + Date.now()
  );

  useEffect(() => {
    setImage(
      images[options.dataset as keyof typeof images] + '?cache=' + Date.now()
    );
  }, [options.dataset]);

  return (
    <div {...props} className={clsx('cartridges', className)}>
      <img src={image} className="cartridges__cartridge" alt="" />
    </div>
  );
};

export default Cartridges;
