'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { useVariables } from '@gitroom/react/helpers/variable.context';

interface PlatformInfo {
  name: string;
  identifier: string;
}

export const ConnectPlatforms: FC<{
  token: string;
  successProvider?: string;
}> = ({ token, successProvider }) => {
  const { backendUrl } = useVariables();
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>(
    successProvider ? [successProvider] : []
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/connect/${token}/integrations`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.msg || 'This connect link is invalid or has expired.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPlatforms(data);
      } catch {
        setError('Failed to load platforms. Please try again.');
      }
      setLoading(false);
    })();
  }, [backendUrl, token]);

  const handleConnect = useCallback(
    async (identifier: string) => {
      setConnecting(identifier);
      try {
        const res = await fetch(
          `${backendUrl}/connect/${token}/social/${identifier}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.msg || 'Failed to start connection.');
          setConnecting(null);
          return;
        }
        const { url } = await res.json();
        window.location.href = url;
      } catch {
        setError('Failed to start connection. Please try again.');
        setConnecting(null);
      }
    },
    [backendUrl, token]
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#612BD3] rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] bg-[#FC69FF] rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="mt-[32px] flex justify-center">
            <div className="w-[48px] h-[48px] border-[3px] border-[#612BD3] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error && platforms.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#612BD3] rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] bg-[#FC69FF] rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-[80px] h-[80px] mx-auto mb-[24px] rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-[40px] h-[40px] text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-[28px] font-semibold mb-[12px]">
            Link Unavailable
          </div>
          <div className="text-[16px] text-gray-400 max-w-[400px]">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#612BD3] rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] bg-[#FC69FF] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[550px] mx-auto px-[20px]">
        <div className="bg-[#1A1919] rounded-[16px] p-[32px] flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[8px] text-center">
            <h1 className="text-[24px] font-semibold">
              Connect Your Social Accounts
            </h1>
            <p className="text-[14px] text-gray-400">
              Select the platforms you want to connect. You can connect multiple accounts.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[8px] p-[12px] text-[14px] text-red-400 text-center">
              {error}
            </div>
          )}

          {connected.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-[8px] p-[12px] text-[14px] text-green-400 text-center">
              Successfully connected: {connected.join(', ')}
            </div>
          )}

          <div className="grid grid-cols-2 gap-[12px]">
            {platforms.map((platform) => {
              const isConnected = connected.includes(platform.identifier);
              const isConnecting = connecting === platform.identifier;

              return (
                <button
                  key={platform.identifier}
                  onClick={() => !isConnecting && handleConnect(platform.identifier)}
                  disabled={isConnecting}
                  className={`flex items-center gap-[12px] p-[16px] rounded-[12px] border transition-all text-left ${
                    isConnected
                      ? 'border-green-500/40 bg-green-500/10'
                      : 'border-[#2A2A2A] bg-[#222222] hover:border-[#612BD3] hover:bg-[#612BD3]/10'
                  } ${isConnecting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                  <div className="flex-1">
                    <div className="text-[14px] font-medium">
                      {platform.name}
                    </div>
                    {isConnected && (
                      <div className="text-[12px] text-green-400 mt-[2px]">
                        Connected
                      </div>
                    )}
                  </div>
                  {isConnecting && (
                    <div className="w-[20px] h-[20px] border-[2px] border-[#612BD3] border-t-transparent rounded-full animate-spin" />
                  )}
                  {isConnected && (
                    <svg className="w-[20px] h-[20px] text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {connected.length > 0 && (
            <div className="text-center text-[14px] text-gray-400">
              You can close this window or connect more accounts above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
