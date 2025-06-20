import clsx from 'clsx';
import { useEffect, useState } from 'react';
import type { DatasetName } from '../../lib/options';
import { useOptionsStore } from '../../stores/options';
import './index.css';

type CartridgesOldProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const images: Record<DatasetName, string> = {
  fz: './cartridges/blue.gif',
  hhgg: './cartridges/yellow.gif',
  lotr: './cartridges/green.gif',
  hp: './cartridges/red.gif',
  shkspr: './cartridges/purple.gif',
};

const CartridgesOld = ({ className = '', ...props }: CartridgesOldProps) => {
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

export default CartridgesOld;
