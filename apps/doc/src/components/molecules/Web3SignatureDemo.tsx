'use client';

import {useState} from 'react';
import {FaEthereum} from 'react-icons/fa';
import {
  IoCheckmarkDoneOutline,
  IoCopyOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoWarningOutline,
} from 'react-icons/io5';

export function Web3SignatureDemo() {
  const [account, setAccount] = useState<string | null>(null);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not found. Please install a Web3 wallet extension.');
      return;
    }
    try {
      setError('');
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      setAccount(accounts[0]);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const sign = async () => {
    if (!account || typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    setIsSigning(true);
    setError('');

    // Simulate backend nonce generation
    const nonce = 'investor-app-nonce-12345';
    const domain = window.location.host;
    const time = new Date().toISOString();

    // EIP-4361 compliant message format
    const message = [
      `${domain} wants you to sign in with your Ethereum account:`,
      account,
      '',
      'I accept the Terms of Service.',
      '',
      `URI: https://${domain}`,
      'Version: 1',
      'Chain ID: 1',
      '',
      `Nonce: ${nonce}`,
      `Issued At: ${time}`,
    ].join('\n');

    const msgHex =
      '0x' +
      Array.from(message)
        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');

    try {
      const sig = await window.ethereum.request({method: 'personal_sign', params: [msgHex, account]});
      setSignature(sig as unknown as string);
    } catch (err: any) {
      setError(err.message || 'Signature rejected');
    } finally {
      setIsSigning(false);
    }
  };

  const copySignature = async () => {
    try {
      await navigator.clipboard.writeText(signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="w-full my-8 mx-auto font-sans not-prose">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <IoWalletOutline size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 m-0">Live Demo</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0">Connect wallet & sign message (EIP-4361)</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 flex items-start gap-3">
              <IoWarningOutline className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600 dark:text-red-400 m-0">{error}</p>
            </div>
          )}

          {/* Step 1: Connect */}
          {!account ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                <FaEthereum size={32} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <h4 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2 mt-0">Connect your Wallet</h4>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto text-sm">
                Securely connect to prove ownership of your address. No gas fees required.
              </p>
              <button
                onClick={connect}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer"
              >
                <IoWalletOutline />
                Connect MetaMask
              </button>
            </div>
          ) : (
            /* Step 2: Connected & Sign */
            <div className="space-y-6">
              {/* Account Info */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-zinc-950 shadow-sm">
                    {account.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider m-0">Connected Account</p>
                    <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-50 sm:max-w-md m-0">
                      {account}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Active</span>
                </div>
              </div>

              {/* Action Area */}
              {!signature ? (
                <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Please sign the authentication message to verify ownership. <br />
                    <span className="text-xs text-zinc-400">Nonce: investor-app-nonce-12345</span>
                  </p>
                  <button
                    onClick={sign}
                    disabled={isSigning}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    {isSigning ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <IoShieldCheckmarkOutline />
                    )}
                    {isSigning ? 'Requesting Signature...' : 'Sign Message'}
                  </button>
                </div>
              ) : (
                /* Success State */
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
                      <IoCheckmarkDoneOutline className="text-green-500" size={18} />
                      Signature Generated
                    </p>
                    <button
                      onClick={copySignature}
                      className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      {copied ? <IoCheckmarkDoneOutline /> : <IoCopyOutline />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="relative group">
                    <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto border border-zinc-800 shadow-inner m-0">
                      {signature}
                    </pre>
                  </div>
                  <p className="text-xs text-zinc-400 text-center m-0">
                    This signature proves you own {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
