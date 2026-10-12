export interface CoverSettingsProps {
  value: string;
  disabled: boolean;
  failed: boolean;
  onChange: (value: string) => void;
  onError: () => void;
}
