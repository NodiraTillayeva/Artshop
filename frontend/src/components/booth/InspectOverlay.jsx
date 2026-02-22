import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoothState, useBoothDispatch } from '@hooks/useBoothStore';

const TYPE_LABELS = {
  print: 'Art Print',
  keychain: 'Acrylic Keychain',
  sticker: 'Vinyl Sticker',
  stickerSheet: 'Sticker Sheet',
  tshirt: 'T-Shirt',
};

const TYPE_HINTS = {
  print: 'Click again to flip',
  keychain: 'Click again to pick up',
  sticker: 'Click again to pick up',
  stickerSheet: 'Click again to pick up',
  tshirt: 'Click to select',
};

const InspectOverlay = () => {
  const { selectedItem, prints, keychains, stickers, stickerSheets, tshirts } = useBoothState();
  const dispatch = useBoothDispatch();

  let item = null;
  if (selectedItem) {
    const lists = { print: prints, keychain: keychains, sticker: stickers, stickerSheet: stickerSheets, tshirt: tshirts };
    item = lists[selectedItem.type]?.find((i) => i.id === selectedItem.id);
  }

  const handleClose = () => {
    dispatch({ type: 'DESELECT_ITEM' });
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95
                     backdrop-blur-sm rounded-xl shadow-xl px-6 py-4 z-10
                     flex items-center gap-4 max-w-lg"
        >
          <img
            src={item.dataUrl}
            alt={item.name}
            className="w-16 h-16 object-contain rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{item.name}</p>
            <p className="text-sm text-gray-500">
              {TYPE_LABELS[selectedItem.type]}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {TYPE_HINTS[selectedItem.type]}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold
                       w-8 h-8 flex items-center justify-center rounded-full
                       hover:bg-gray-100 transition-colors"
          >
            x
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InspectOverlay;
