import { useBoothState, useBoothDispatch } from '@hooks/useBoothStore';
import { SECTION_LIST, SECTION_LABELS } from '@utils/boothConstants';

const SectionNav = () => {
  const { activeSection } = useBoothState();
  const dispatch = useBoothDispatch();

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-1.5 flex-wrap">
      {SECTION_LIST.map((key) => (
        <button
          key={key}
          onClick={() => dispatch({ type: 'SET_SECTION', payload: key })}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${
              activeSection === key
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-white/30 text-white hover:bg-white/50 backdrop-blur-sm'
            }`}
        >
          {SECTION_LABELS[key]}
        </button>
      ))}
    </div>
  );
};

export default SectionNav;
