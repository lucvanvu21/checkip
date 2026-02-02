// app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Globe,
  MapPin,
  Server,
  Shield,
  Monitor,
  Wifi,
  Copy,
  Check,
  CreditCard,
  Clock,
  Clock1,
  PhoneCall,
  Building2,
  NetworkIcon,
  MailCheck,
  Building,
  Network,
  ScrollTextIcon,
  ClipboardPasteIcon,
  Clipboard,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

// Types
interface CheckIPResponse {
  status: string;
  date_added: string;
  total_ip: string;
}

interface WhoerIPData {
  ip: string;
  continent: string;
  continent_code: string;
  country: string;
  iso_code: string;
  province: string;
  province_code: string;
  city: string;
  isp: string;
  postal: string;
  isp_score: number;
  timezone: string;
  timezones: string[] | null;
  local_time: string;
  ip_number: number;
  version: number;
  asn: number;
  asn_organization: string;
  connection_type: string;
  user_type: string;
  latitude: number;
  longitude: number;
  network: string;
  ip_range: string;
  is_anonymous_vpn: boolean;
  is_public_proxy: boolean;
  is_route_ip_black_list: boolean;
  hostname: string;
  dns: string | null;
}

interface WhoerBrowserData {
  os: string;
  ua: string;
  name: string;
  version: string;
  languages: string[];
  language: string;
  dnt: boolean;
}

interface WhoerResponse {
  code: number;
  message: string;
  data: {
    ip: WhoerIPData;
    browser: WhoerBrowserData;
  };
}
export interface IpapiCompany {
  name: string;
  abuser_score: string;
  domain: string;
  type: string;
  network: string;
  whois: string;
}

export interface IpapiAbuse {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface IpapiASN {
  asn: number;
  abuser_score: string;
  route: string;
  descr: string;
  country: string;
  active: boolean;
  org: string;
  domain: string;
  abuse: string;
  type: string;
  updated: string;
  rir: string;
  whois: string;
}

export interface IpapiLocation {
  is_eu_member: boolean;
  calling_code: string;
  currency_code: string;
  continent: string;
  country: string;
  country_code: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  zip: string;
  timezone: string;
  local_time: string;
  local_time_unix: number;
  is_dst: boolean;
}

export interface IpapiData {
  ip: string;
  rir: string;
  is_bogon: boolean;
  is_mobile: boolean;
  is_satellite: boolean;
  is_crawler: boolean;
  is_datacenter: boolean;
  is_tor: boolean;
  is_proxy: boolean;
  is_vpn: boolean;
  is_abuser: boolean;
  company: IpapiCompany;
  abuse: IpapiAbuse;
  asn: IpapiASN;
  location: IpapiLocation;
  elapsed_ms: number;
}

interface ResultData {
  check: CheckIPResponse;
  whoer: WhoerResponse['data'] | null;
  apiis?: IpapiData;
}
const UserTypeBadge = ({ type }: { type: string }) => {
  let color = 'bg-orange-500'; // default: màu cam cho loại khác
  let label = type;

  if (!type) return <span className="text-gray-400">Unknown</span>;

  switch (type.toLowerCase()) {
    case 'business':
      color = 'bg-blue-500';
      label = 'Business';
      break;
    case 'residential':
      color = 'bg-green-500';
      label = 'Residential';
      break;
    case 'hosting':
      color = 'bg-orange-500';
      label = 'Hosting';
      break;
  }

  return <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white ${color}`}>{label}</span>;
};

export default function IPChecker() {
  const [ip, setIp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [resultIpapi, setResultIpapi] = useState<IpapiData | null>(null);
  const [resultWhoer, setResultWhoer] = useState<WhoerResponse['data'] | null>(null);
  const [resultCheck, setResultCheck] = useState<CheckIPResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);

  const add = async () => {
    try {
      const response = await fetch(`https://bet.smsbet.top/add_ip.php?ip=${ip}`);
      const data = await response.json();
      if (data.status === 'success') {
        setAdded(true);
        toast.success('Đã thêm ip vào database');
        checkIP();
      } else {
        setAdded(false);
        toast.error('Lỗi khi thêm ip');
      }
    } catch (err) {
      // console.error(err);
      toast.error('Lỗi khi thêm ip');
      setAdded(false);
    }
  };

  // const checkIP = async (): Promise<void> => {
  //   setError('');
  //   setResult(null);
  //   setResultCheck(null);
  //   setResultWhoer(null);
  //   setResultIpapi(null);
  //   setLoading(true);

  //   let targetIp = ip.trim();

  //   // Nếu chưa nhập IP, tự động lấy IP public của người dùng
  //   if (!targetIp) {
  //     try {
  //       const res = await fetch('https://api.ipify.org?format=json');
  //       const data = await res.json();
  //       targetIp = data.ip;
  //       setIp(targetIp);
  //     } catch {
  //       setError('Không thể lấy IP hiện tại của bạn');
  //       setLoading(false);
  //       return;
  //     }
  //   }

  //   // Kiểm tra định dạng IPv4
  //   const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  //   if (!ipRegex.test(targetIp)) {
  //     setError('Địa chỉ IP không hợp lệ');
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const startCheck = performance.now();
  //     const checkResponse = await fetch(`https://bet.smsbet.top/check_ip.php?ip=${targetIp}`);
  //     const checkData: CheckIPResponse = await checkResponse.json();
  //     const endCheck = performance.now();
  //     console.log(`%c[CHECK DB] ${Math.round(endCheck - startCheck)} ms`, 'color: #4ade80');

  //     /* ===================== API 2 ===================== */
  //     const startWhoer = performance.now();
  //     const whoerResponse = await fetch(`https://whoer.com/api_v1/index/index?language=vi-vn&ip=${targetIp}`);
  //     // const whoerResponse = await fetch(`/api/whoer?ip=${targetIp}`);

  //     const whoerData: WhoerResponse = await whoerResponse.json();
  //     const endWhoer = performance.now();
  //     console.log(`%c[WHOER] ${Math.round(endWhoer - startWhoer)} ms`, 'color: #60a5fa');

  //     /* ===================== API 3 ===================== */
  //     const startIpapi = performance.now();
  //     const apiip = await fetch(`https://api.ipapi.is/?q=${targetIp}`);
  //     const ipapiData: IpapiData = await apiip.json();
  //     const endIpapi = performance.now();
  //     console.log(`%c[IPAPI] ${Math.round(endIpapi - startIpapi)} ms`, 'color: #facc15');

  //     // setResult({
  //     //   check: checkData,
  //     //   whoer: whoerData.data,
  //     //   apiis: ipapiData,
  //     // });
  //     setResultCheck(checkData);
  //     setResultWhoer(whoerData.code === 200 ? whoerData.data : null);
  //     setResultIpapi(ipapiData);
  //   } catch (err) {
  //     setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const checkIP = async (): Promise<void> => {
    setError('');
    setLoading(true);
    setResultCheck(null);
    setResultWhoer(null);
    setResultIpapi(null);

    let targetIp = ip.trim();

    if (!targetIp) {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      targetIp = data.ip;
      setIp(targetIp);
    }

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(targetIp)) {
      setError('IP không hợp lệ');
      setLoading(false);
      return;
    }

    /* ================= CHECK DB ================= */
    (async () => {
      // const start = performance.now();
      const res = await fetch(`/api/check-ip?ip=${targetIp}`);
      const data = await res.json();
      // console.log(`[CHECK DB] ${Math.round(performance.now() - start)} ms`);
      setResultCheck(data); // 🔥 render ngay
    })();

    /* ================= WHOER ================= */
    (async () => {
      // const start = performance.now();
      try {
        const res = await fetch(`https://whoer.com/api_v1/index/index?language=vi-VN&ip=${targetIp}`);
        const data = await res.json();
        // console.log(`[WHOER] ${Math.round(performance.now() - start)} ms`);
        setLoading(false);
        setResultWhoer(data.code === 200 ? data.data : null);
      } catch {
        setResultWhoer(null);
      }
    })();

    /* ================= IPAPI ================= */
    (async () => {
      // const start = performance.now();
      const res = await fetch(`https://api.ipapi.is/?q=${targetIp}`);
      const data = await res.json();
      // console.log(`[IPAPI] ${Math.round(performance.now() - start)} ms`);
      setResultIpapi(data);
    })();

    setLoading(false); // ❗ KHÔNG chờ API
  };

  useEffect(() => {
    checkIP();
  }, []);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      checkIP();
    }
  };
  console.log('ResultWhoer:', loading);

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFraudScoreColor = (score: number): string => {
    console.log('Fraud score:', score);
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getFraudScoreText = (score: number): string => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Medium Risk';
    return 'High Risk';
  };
  function formatToVietnamTime(dateString: string) {
    const date = new Date(dateString + ' UTC');
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Toaster />
        {/* Header */}
        <div className="text-center mb-8">
          {' '}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <div onClick={() => window.location.reload()} className="cursor-pointer">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Check IP</h1>
          <p className="text-gray-400">Kiểm tra thông tin chi tiết địa chỉ IP</p>
        </div>
        {/* Search Box */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-6 mb-8 sticky top-0 z-50 ">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-3 relative">
              <input
                type="text"
                value={ip}
                onChange={e => setIp(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập địa chỉ IP (vd: 42.119.88.113)"
                className="w-full px-4 py-2 sm:py-3 pl-12 pr-12 bg-slate-900/50 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <button
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setIp(text.trim());
                  } catch {
                    alert('Không thể đọc clipboard – hãy cho phép trình duyệt truy cập clipboard.');
                  }
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition p-4"
                title="Dán IP từ clipboard"
              >
                <Clipboard className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-2 flex flex-row-reverse sm:flex-row gap-3">
              <button
                onClick={checkIP}
                disabled={loading}
                className="flex-1 px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang kiểm tra...
                  </span>
                ) : (
                  'Kiểm tra'
                )}
              </button>

              <button
                onClick={add}
                disabled={loading}
                className="flex-1 px-8 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Thêm IP
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}
        </div>
        {/* Results */}
        {/* {result && result.whoer && result.whoer.ip && ( */}
        {resultCheck && (
          <div className="space-y-6">
            {/* Database Status Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    resultCheck.status === 'exists' ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}
                >
                  <Shield className={`w-6 h-6 ${resultCheck.status === 'exists' ? 'text-red-400' : 'text-green-400'}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Trạng thái ip {ip}</h2>
                  <p className="text-sm text-gray-400">Kiểm tra trong cơ sở dữ liệu</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Trạng thái ip {ip}</p>
                  <p className={`text-lg font-bold ${resultCheck.status === 'exists' ? 'text-red-400' : 'text-green-400'}`}>
                    {resultCheck.status === 'exists' ? 'Đã tồn tại' : 'Chưa tồn tại'}
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Ngày thêm</p>
                  <p className="text-lg font-semibold text-gray-300">{formatToVietnamTime(resultCheck.date_added) || 'N/A'}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Tổng IP</p>
                  <p className="text-lg font-semibold text-gray-300">{parseInt(resultCheck.total_ip).toLocaleString()}</p>
                </div>
              </div>
            </div>
            {/* Main IP Card */}
            {!resultWhoer && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-white text-lg font-medium">Đang tải dữ liệu...</span>
                  </div>
                </div>
              </div>
            )}
            {resultWhoer && resultWhoer.ip && (
              <>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                      <span className="text-4xl">🇻🇳</span>
                      <h2 className="text-3xl font-bold text-white">
                        My IP: {resultWhoer.ip.ip}
                        <button
                          onClick={() => result?.whoer && copyToClipboard(resultWhoer.ip.ip)}
                          className="ml-3 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </button>
                      </h2>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <p className="text-xl text-gray-300">
                        {resultWhoer.ip.city || resultWhoer.ip.province} / {resultWhoer.ip.province} / {resultWhoer.ip.country}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-medium">Secure internet</span>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <InfoRow icon={<Wifi className="w-5 h-5 text-blue-400" />} label="ISP:" value={resultWhoer.ip.isp} />
                      <InfoRow
                        icon={<Monitor className="w-5 h-5 text-gray-400" />}
                        label="Hostname:"
                        value={resultWhoer.ip.hostname || 'N/A'}
                      />
                      <InfoRow
                        icon={<Server className="w-5 h-5 text-blue-400" />}
                        label="OS:"
                        value={resultWhoer.browser?.os || 'Windows 10'}
                      />
                      <InfoRow
                        icon={<Globe className="w-5 h-5 text-blue-400" />}
                        label="Browser:"
                        value={resultWhoer.browser?.name || 'Google Chrome'}
                      />
                      <InfoRow
                        icon={<Shield className="w-5 h-5 text-purple-400" />}
                        label="Canvas:"
                        value="oI4dWVbrTTmMoI704XTLIg=="
                      />
                      <InfoRow
                        icon={<MapPin className="w-5 h-5 text-blue-400" />}
                        label="IP type:"
                        value={<UserTypeBadge type={resultWhoer.ip.user_type} />}
                      />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <InfoRow
                        icon={<Server className="w-5 h-5 text-purple-400" />}
                        label="DNS:"
                        value={
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300">{resultWhoer.ip.dns || 'N/A'}</span>
                            <span className="text-sm text-gray-500">
                              🇻🇳 {resultWhoer.ip.country}({resultWhoer.ip.iso_code})
                            </span>
                          </div>
                        }
                      />
                      <InfoRow
                        icon={<Shield className="w-5 h-5 text-gray-400" />}
                        label="Proxy:"
                        value={<StatusBadge status={!resultWhoer.ip.is_public_proxy} trueText="No" falseText="Yes" />}
                      />
                      <InfoRow
                        icon={<Shield className="w-5 h-5 text-blue-400" />}
                        label="Anonymizer:"
                        value={<StatusBadge status={!resultWhoer.ip.is_anonymous_vpn} trueText="No" falseText="Yes" />}
                      />
                      <InfoRow
                        icon={<Shield className="w-5 h-5 text-red-400" />}
                        label="Blacklist:"
                        value={<StatusBadge status={!resultWhoer.ip.is_route_ip_black_list} trueText="No" falseText="Yes" />}
                      />
                      <InfoRow
                        icon={<Wifi className="w-5 h-5 text-green-400" />}
                        label="Fraud score:"
                        value={
                          <span
                            className={`px-3 py-1 ${getFraudScoreColor(
                              resultWhoer.ip.isp_score
                            )} text-white text-sm rounded-md font-medium`}
                          >
                            {resultWhoer.ip.isp_score} ({getFraudScoreText(resultWhoer.ip.isp_score)})
                          </span>
                        }
                      />
                      <InfoRow
                        icon={<Server className="w-5 h-5 text-blue-400" />}
                        label="ASN:"
                        value={resultWhoer.ip.asn_organization}
                      />
                    </div>
                  </div>
                  <div></div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-8">
                  <div className="text-center mb-8">
                    <InfoRow
                      icon={<Globe className="w-5 h-5 text-green-400" />}
                      label="Continent:"
                      value={`${resultWhoer.ip.continent} (${resultWhoer.ip.continent_code})`}
                    />

                    <InfoRow
                      icon={<Server className="w-5 h-5 text-blue-400" />}
                      label="Connection Type:"
                      value={resultWhoer.ip.connection_type || 'N/A'}
                    />

                    <InfoRow
                      icon={<Server className="w-5 h-5 text-purple-400" />}
                      label="Network:"
                      value={resultWhoer.ip.network}
                    />

                    <InfoRow
                      icon={<Server className="w-5 h-5 text-blue-400" />}
                      label="IP Range:"
                      value={resultWhoer.ip.ip_range}
                    />

                    <InfoRow
                      icon={<Globe className="w-5 h-5 text-blue-400" />}
                      label="Timezone:"
                      value={resultWhoer.ip.timezone}
                    />

                    <InfoRow
                      icon={<MapPin className="w-5 h-5 text-green-400" />}
                      label="Local Time:"
                      value={resultWhoer.ip.local_time}
                    />

                    <InfoRow
                      icon={<MapPin className="w-5 h-5 text-blue-400" />}
                      label="Postal Code:"
                      value={resultWhoer.ip.postal || 'N/A'}
                    />

                    <InfoRow
                      icon={<Wifi className="w-5 h-5 text-gray-400" />}
                      label="IP Version:"
                      value={resultWhoer.ip.version === 6 ? 'IPv6' : 'IPv4'}
                    />

                    <InfoRow
                      icon={<Shield className="w-5 h-5 text-yellow-400" />}
                      label="Do Not Track:"
                      value={<StatusBadge status={!resultWhoer.browser.dnt} trueText="Off" falseText="On" />}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="mt-8 p-6 rounded-2xl bg-gray-900/60 backdrop-blur-lg border border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Server className="w-6 h-6 text-blue-400" />
                IPAPI Information
              </h2>

              <div className="mt-8 p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Server className="w-6 h-6 text-blue-400" />
                  IPAPI Information
                </h2>
                {/* Group 3 - Location */}
                <div className="border-t border-slate-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    Location
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InfoRow
                      label="Country"
                      value={resultIpapi?.location?.country || ''}
                      icon={<Globe className="w-5 h-5 text-blue-400" />}
                    />
                    <InfoRow
                      label="State"
                      value={resultIpapi?.location.state}
                      icon={<MapPin className="w-5 h-5 text-gray-400" />}
                    />
                    <InfoRow
                      label="City"
                      value={resultIpapi?.location.city}
                      icon={<MapPin className="w-5 h-5 text-yellow-400" />}
                    />
                    <InfoRow label="ZIP" value={resultIpapi?.location.zip} icon={<Server className="w-5 h-5 text-gray-400" />} />
                    <InfoRow
                      label="Timezone"
                      value={resultIpapi?.location.timezone}
                      icon={<Clock className="w-5 h-5 text-green-400" />}
                    />
                    <InfoRow
                      label="Local Time"
                      value={resultIpapi?.location.local_time}
                      icon={<Clock className="w-5 h-5 text-purple-400" />}
                    />
                  </div>
                </div>
                {/* Group 1 - IP Info */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <InfoRow icon={<Globe className="w-5 h-5 text-blue-400" />} label="IP Address" value={resultIpapi?.ip} />
                  <InfoRow icon={<Server className="w-5 h-5 text-purple-400" />} label="RIR" value={resultIpapi?.rir} />
                  <InfoRow
                    icon={<Shield className="w-5 h-5 text-green-400" />}
                    label="Company Type"
                    value={<CompanyTypeBadge type={resultIpapi?.company.type || ''} />}
                  />
                  <InfoRow
                    icon={<Shield className="w-5 h-5 text-orange-400" />}
                    label="Proxy / VPN / Tor"
                    value={resultIpapi?.is_proxy || resultIpapi?.is_vpn || resultIpapi?.is_tor ? 'Yes' : 'No'}
                  />
                  <InfoRow
                    icon={<Server className="w-5 h-5 text-gray-400" />}
                    label="Datacenter"
                    value={resultIpapi?.is_datacenter ? 'Yes' : 'No'}
                  />
                </div>

                {/* Group 2 - Company */}
                <div className="border-t border-slate-700 pt-4 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-indigo-400" />
                    Company / ISP
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InfoRow
                      icon={<Building className="w-5 h-5 text-indigo-400" />}
                      label="Name"
                      value={`${resultIpapi?.company.name} (${resultIpapi?.company.domain})`}
                    />
                    <InfoRow
                      icon={<Network className="w-5 h-5 text-blue-400" />}
                      label="Network Range"
                      value={resultIpapi?.company.network}
                    />
                    <InfoRow
                      icon={<Server className="w-5 h-5 text-green-400" />}
                      label="ASN"
                      value={`AS${resultIpapi?.asn.asn} (${resultIpapi?.asn.org})`}
                    />
                    <InfoRow
                      icon={<MailCheck className="w-5 h-5 text-red-400" />}
                      label="route"
                      value={resultIpapi?.asn?.route}
                    />
                    <InfoRow
                      icon={<PhoneCall className="w-5 h-5 text-green-400" />}
                      label="update"
                      value={resultIpapi?.asn?.updated}
                    />
                    <InfoRow
                      icon={<ScrollTextIcon className="w-5 h-5 text-green-400" />}
                      label="Socre"
                      value={
                        <span
                          className={`px-3 py-1 ${getFraudScoreColor(
                            resultIpapi?.asn.abuser_score ? parseInt(resultIpapi?.asn.abuser_score) : 0
                          )} text-white text-sm rounded-md font-medium`}
                        >
                          {resultIpapi?.asn.abuser_score} (
                          {getFraudScoreText(resultIpapi?.asn.abuser_score ? parseInt(resultIpapi?.asn.abuser_score) : 0)})
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-700/50">
      <div className="flex items-center gap-2 min-w-[140px]">
        {icon}
        <span className="text-gray-400 font-medium">{label}</span>
      </div>
      <div className="flex-1 text-gray-300 font-medium">{typeof value === 'string' ? value : value}</div>
    </div>
  );
}
const CompanyTypeBadge = ({ type }: { type: string }) => {
  let color = 'bg-orange-500';
  const label = type || 'Unknown';

  if (type) {
    switch (type.toLowerCase()) {
      case 'business':
        color = 'bg-blue-500';
        break;
      case 'residential':
        color = 'bg-green-500';
        break;
      case 'isp':
        color = 'bg-indigo-500';
        break;
      default:
        color = 'bg-orange-500';
        break;
    }
  }

  return <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${color}`}>{label}</span>;
};

interface StatusBadgeProps {
  status: boolean;
  trueText: string;
  falseText: string;
}

function StatusBadge({ status, trueText, falseText }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={status ? 'text-green-400' : 'text-red-400'}>{status ? trueText : falseText}</span>
    </div>
  );
}
