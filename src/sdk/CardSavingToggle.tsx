
import { useTranslation } from 'react-i18next';

interface CardSavingToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const CardSavingToggle = ({ enabled, onChange }: CardSavingToggleProps) => {
  const { t } = useTranslation();

  const handleToggle = () => {
    const deviceSupportsSecureStorage = true; // replace with real logic
    if (!deviceSupportsSecureStorage) {
      // Handle error case
      return;
    }
    onChange(!enabled);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-800">
          {t('saveCard')}
        </label>
        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            enabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default CardSavingToggle;