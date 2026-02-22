import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoothDispatch, useBoothState } from '@hooks/useBoothStore';
import { alphaToShape } from '@utils/alphaToShape';
import {
  MAX_PRINTS,
  MAX_KEYCHAINS,
  MAX_STICKERS,
  MAX_STICKER_SHEETS,
  MAX_TSHIRTS,
} from '@utils/boothConstants';
import toast from 'react-hot-toast';

const UploadZone = ({ label, count, max, onFiles, accept, dragColor, hint }) => {
  const [dragOver, setDragOver] = useState(false);
  const id = `upload-${label.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="mb-3">
      <label className="text-xs font-semibold text-gray-700 mb-1 block">
        {label} ({count}/{max})
      </label>
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith('image/') ||
            f.name.toLowerCase().endsWith('.glb') ||
            f.name.toLowerCase().endsWith('.gltf')
          );
          onFiles(files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-2.5 text-center text-xs
          transition-colors ${
            dragOver
              ? `${dragColor} bg-opacity-10`
              : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        {hint && <p className="text-gray-400 text-[10px] mb-1">{hint}</p>}
        <input
          type="file"
          accept={accept}
          multiple
          onChange={(e) => {
            onFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
          className="hidden"
          id={id}
        />
        <label
          htmlFor={id}
          className="inline-block px-2.5 py-1 text-xs border border-gray-300
                     rounded cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Browse
        </label>
      </div>
    </div>
  );
};

const ItemRow = ({ item, onRemove }) => (
  <div className="flex justify-between items-center text-xs py-0.5">
    <div className="flex items-center gap-1.5 min-w-0">
      {item.dataUrl ? (
        <img src={item.dataUrl} alt="" className="w-5 h-5 object-contain rounded" />
      ) : (
        <span className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-500">3D</span>
      )}
      <span className="truncate text-gray-700">{item.name}</span>
      {item.stock != null && (
        <span className="text-[10px] text-gray-400 flex-shrink-0">x{item.stock}</span>
      )}
    </div>
    <button
      onClick={onRemove}
      className="text-red-400 hover:text-red-600 ml-1 text-[10px] font-bold
                 w-4 h-4 flex items-center justify-center rounded
                 hover:bg-red-50 transition-colors flex-shrink-0"
    >
      x
    </button>
  </div>
);

const UploadPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [processing, setProcessing] = useState(false);
  const dispatch = useBoothDispatch();
  const { prints, keychains, stickers, stickerSheets, tshirts } = useBoothState();

  const makeId = (prefix) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const processPrint = useCallback(
    (files) => {
      files.forEach((file) => {
        if (prints.length >= MAX_PRINTS) {
          toast.error(`Max ${MAX_PRINTS} prints`);
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const img = new Image();
          img.onload = () => {
            dispatch({
              type: 'ADD_PRINT',
              payload: {
                id: makeId('print'),
                name: file.name,
                dataUrl,
                width: img.width,
                height: img.height,
              },
            });
            toast.success('Print added!');
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });
    },
    [dispatch, prints.length]
  );

  const processShapeItem = useCallback(
    (files, type, max, currentLength) => {
      files.forEach(async (file) => {
        if (currentLength >= max) {
          toast.error(`Max ${max} ${type}s`);
          return;
        }

        // Ask for stock quantity for stickers
        let stock = null;
        if (type === 'sticker') {
          const input = window.prompt(`How many "${file.name}" stickers in stock?`, '10');
          if (input === null) return; // cancelled
          stock = Math.max(0, parseInt(input, 10) || 0);
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target.result;
          setProcessing(true);
          try {
            const shape = await alphaToShape(dataUrl);
            const payload = { id: makeId(type), name: file.name, dataUrl, shape };
            if (stock !== null) payload.stock = stock;
            dispatch({
              type: type === 'keychain' ? 'ADD_KEYCHAIN' : 'ADD_STICKER',
              payload,
            });
            toast.success(
              type === 'sticker'
                ? `Sticker added! (${stock} in stock)`
                : 'Keychain added!'
            );
          } catch {
            toast.error(`Failed to process ${type}`);
          } finally {
            setProcessing(false);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [dispatch]
  );

  const processStickerSheet = useCallback(
    (files) => {
      files.forEach((file) => {
        if (stickerSheets.length >= MAX_STICKER_SHEETS) {
          toast.error(`Max ${MAX_STICKER_SHEETS} sticker sheets`);
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          dispatch({
            type: 'ADD_STICKER_SHEET',
            payload: {
              id: makeId('sheet'),
              name: file.name,
              dataUrl: e.target.result,
            },
          });
          toast.success('Sticker sheet added!');
        };
        reader.readAsDataURL(file);
      });
    },
    [dispatch, stickerSheets.length]
  );

  const processTShirt = useCallback(
    (files) => {
      // Separate GLB model files from image (design) files
      const glbFiles = files.filter((f) =>
        f.name.toLowerCase().endsWith('.glb') || f.name.toLowerCase().endsWith('.gltf')
      );
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));

      // If a GLB + an image are provided together, pair them
      // Otherwise handle each type individually
      if (glbFiles.length > 0 && imageFiles.length > 0) {
        // Paired upload: GLB model + design image
        const glbFile = glbFiles[0];
        const imgFile = imageFiles[0];
        if (tshirts.length >= MAX_TSHIRTS) {
          toast.error(`Max ${MAX_TSHIRTS} t-shirts`);
          return;
        }
        const modelUrl = URL.createObjectURL(glbFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          dispatch({
            type: 'ADD_TSHIRT',
            payload: {
              id: makeId('tshirt'),
              name: glbFile.name,
              dataUrl: e.target.result,
              modelUrl,
              designUrl: e.target.result,
            },
          });
          toast.success('T-shirt with 3D model added!');
        };
        reader.readAsDataURL(imgFile);
      } else if (glbFiles.length > 0) {
        // GLB only — no design texture
        glbFiles.forEach((file) => {
          if (tshirts.length >= MAX_TSHIRTS) {
            toast.error(`Max ${MAX_TSHIRTS} t-shirts`);
            return;
          }
          const modelUrl = URL.createObjectURL(file);
          dispatch({
            type: 'ADD_TSHIRT',
            payload: {
              id: makeId('tshirt'),
              name: file.name,
              dataUrl: null,
              modelUrl,
            },
          });
          toast.success('3D t-shirt added!');
        });
      } else {
        // Images only — flat t-shirt preview with design
        imageFiles.forEach((file) => {
          if (tshirts.length >= MAX_TSHIRTS) {
            toast.error(`Max ${MAX_TSHIRTS} t-shirts`);
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            dispatch({
              type: 'ADD_TSHIRT',
              payload: {
                id: makeId('tshirt'),
                name: file.name,
                dataUrl: e.target.result,
              },
            });
            toast.success('T-shirt added!');
          };
          reader.readAsDataURL(file);
        });
      }
    },
    [dispatch, tshirts.length]
  );

  const allItems = [
    ...prints.map((p) => ({ ...p, itemType: 'print', removeAction: 'REMOVE_PRINT' })),
    ...keychains.map((k) => ({ ...k, itemType: 'keychain', removeAction: 'REMOVE_KEYCHAIN' })),
    ...stickers.map((s) => ({ ...s, itemType: 'sticker', removeAction: 'REMOVE_STICKER' })),
    ...stickerSheets.map((s) => ({ ...s, itemType: 'stickerSheet', removeAction: 'REMOVE_STICKER_SHEET' })),
    ...tshirts.map((t) => ({ ...t, itemType: 'tshirt', removeAction: 'REMOVE_TSHIRT' })),
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur
                   px-3 py-1.5 rounded-lg shadow-md hover:bg-white
                   transition-colors font-semibold text-xs"
      >
        {isOpen ? 'Hide' : 'Upload'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-12 right-4 w-64 bg-white/95 backdrop-blur-sm
                       rounded-xl shadow-xl p-3 z-10 max-h-[75vh] overflow-y-auto"
          >
            <h3 className="font-bold text-sm mb-2">Stock Your Booth</h3>

            <UploadZone
              label="Prints"
              count={prints.length}
              max={MAX_PRINTS}
              onFiles={processPrint}
              accept="image/*"
              dragColor="border-blue-500"
            />

            <UploadZone
              label="Keychains"
              count={keychains.length}
              max={MAX_KEYCHAINS}
              onFiles={(f) => processShapeItem(f, 'keychain', MAX_KEYCHAINS, keychains.length)}
              accept="image/png"
              dragColor="border-amber-500"
              hint="PNG with transparent BG"
            />

            <UploadZone
              label="Stickers"
              count={stickers.length}
              max={MAX_STICKERS}
              onFiles={(f) => processShapeItem(f, 'sticker', MAX_STICKERS, stickers.length)}
              accept="image/png"
              dragColor="border-green-500"
              hint="PNG with transparent BG"
            />

            <UploadZone
              label="Sticker Sheets"
              count={stickerSheets.length}
              max={MAX_STICKER_SHEETS}
              onFiles={processStickerSheet}
              accept="image/*"
              dragColor="border-teal-500"
              hint="Full sticker sheet images"
            />

            <UploadZone
              label="T-Shirts"
              count={tshirts.length}
              max={MAX_TSHIRTS}
              onFiles={processTShirt}
              accept="image/*,.glb,.gltf"
              dragColor="border-purple-500"
              hint=".glb 3D model or design image"
            />

            {processing && (
              <p className="text-[10px] text-amber-600 mb-1">Processing shape...</p>
            )}

            {allItems.length > 0 && (
              <div className="border-t pt-2 mt-1">
                <h4 className="text-xs font-semibold mb-1">Your Items</h4>
                {allItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onRemove={() =>
                      dispatch({ type: item.removeAction, payload: item.id })
                    }
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UploadPanel;
