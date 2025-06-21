import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { usePoemStore } from '../../stores/poem';
import './index.css';

type ShareProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const Share = ({ className = '', ...props }: ShareProps) => {
  const verses = usePoemStore((state) => state.verses);
  const [isSharingSupported, setIsSharingSupported] = useState(false);

  const shareData = {
    url: window.location.href,
    title: `Glitchy BARD - ${verses[0][0].line}`,
  };

  useEffect(() => {
    if (navigator.canShare && navigator.canShare(shareData)) {
      setIsSharingSupported(true);
    }
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <div {...props} className={clsx('share', className)}>
      {isSharingSupported ? (
        <button onClick={handleShare} className="text-link">
          Share
        </button>
      ) : (
        <p className="muted">You can share the poem by copying the URL.</p>
      )}
    </div>
  );
};

export default Share;
