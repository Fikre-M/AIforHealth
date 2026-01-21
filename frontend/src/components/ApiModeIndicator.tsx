import { config } from '@/config/env';

export const ApiModeIndicator = () => {
  if (!config.isDevelopment) return null;

  return (
    <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-xs font-medium z-50 ${
      config.useMockApi 
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
        : 'bg-green-100 text-green-800 border border-green-300'
    }`}>
      {config.useMockApi ? '🔧 Mock API' : '🌐 Real API'}
    </div>
  );
};