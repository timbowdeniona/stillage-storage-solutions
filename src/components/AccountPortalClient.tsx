'use client';

import React, { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  LogOut,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  RotateCcw,
  Save,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User as UserIcon,
} from 'lucide-react';
import { formatGBP, useVat } from '@/context/VatContext';
import type { UserRole } from '@/lib/roles';
import type { OrderItemRecord } from '../../db/schema';

export interface SerializedAccountUser {
  id: number | null;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  provider: string | null;
  companyName: string | null;
  phone: string | null;
  defaultPostcode: string | null;
  defaultTailLift: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
}

export interface SerializedOrderRecord {
  id: number;
  orderReference: string;
  userId: number | null;
  customerEmail: string;
  companyName: string | null;
  purchaseOrderNumber: string | null;
  paymentMode: string;
  status: string;
  stripeSessionId: string | null;
  stripeInvoiceId: string | null;
  invoiceNumber: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  itemsJson: OrderItemRecord[];
  totalUnits: number;
  subtotalExVatPence: number;
  deliveryExVatPence: number;
  vatPence: number;
  totalIncVatPence: number;
  postcode: string;
  deliveryZone: string | null;
  requiresTailLift: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountPortalClientProps {
  user: SerializedAccountUser;
  orders: SerializedOrderRecord[];
  adminNotice?: boolean;
}

interface ProfileState {
  companyName: string | null;
  phone: string | null;
  defaultPostcode: string | null;
  defaultTailLift: boolean;
}

type AccountTab = 'orders' | 'profile';

const UK_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/London',
});

function formatUkDate(isoString: string): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable';
  }
  return UK_DATE_FORMATTER.format(parsed);
}

function formatProviderLabel(provider: string | null): string {
  switch ((provider || '').toLowerCase()) {
    case 'google':
      return 'Google';
    case 'microsoft-entra-id':
      return 'Microsoft Entra ID';
    case 'facebook':
      return 'Facebook';
    case 'dev-login':
      return 'Local Dev Test';
    default:
      return 'Social SSO';
  }
}

function formatPaymentModeLabel(paymentMode: string): string {
  return paymentMode === 'b2b_proforma' ? '30-Day B2B Proforma' : 'Stripe Card';
}

function getOrderStatusConfig(status: string): { label: string; className: string } {
  switch (status.toLowerCase()) {
    case 'paid':
      return {
        label: 'Paid',
        className: 'bg-accent-teal text-surface-white',
      };
    case 'invoiced':
      return {
        label: 'Invoiced',
        className: 'bg-accent-amber text-surface-white',
      };
    case 'dispatched':
      return {
        label: 'Dispatched',
        className: 'bg-stillage-blue text-surface-white',
      };
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-steel-600 text-surface-white',
      };
    default:
      return {
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending',
        className: 'bg-steel-600 text-surface-white',
      };
  }
}

function isOpenProforma(order: SerializedOrderRecord): boolean {
  if (order.paymentMode !== 'b2b_proforma') return false;
  const normalized = order.status.toLowerCase();
  return normalized === 'invoiced' || normalized === 'pending' || normalized === 'open';
}

export function AccountPortalClient({
  user,
  orders,
  adminNotice = false,
}: AccountPortalClientProps) {
  const router = useRouter();
  const {
    formatPrice,
    showIncVat,
    clearBasket,
    addToBasket,
    setDeliveryPostcode,
    setRequiresTailLift,
  } = useVat();

  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const [noticeDismissed, setNoticeDismissed] = useState<boolean>(false);

  const [profileState, setProfileState] = useState<ProfileState>({
    companyName: user.companyName,
    phone: user.phone,
    defaultPostcode: user.defaultPostcode,
    defaultTailLift: user.defaultTailLift,
  });

  const [companyNameInput, setCompanyNameInput] = useState<string>(user.companyName ?? '');
  const [phoneInput, setPhoneInput] = useState<string>(user.phone ?? '');
  const [defaultPostcodeInput, setDefaultPostcodeInput] = useState<string>(
    user.defaultPostcode ?? ''
  );
  const [defaultTailLiftInput, setDefaultTailLiftInput] = useState<boolean>(user.defaultTailLift);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const baseId = useId();
  const ordersTabId = `${baseId}-tab-orders`;
  const profileTabId = `${baseId}-tab-profile`;
  const ordersPanelId = `${baseId}-panel-orders`;
  const profilePanelId = `${baseId}-panel-profile`;
  const companyFieldId = `${baseId}-company`;
  const phoneFieldId = `${baseId}-phone`;
  const postcodeFieldId = `${baseId}-postcode`;
  const tailLiftFieldId = `${baseId}-tail-lift`;

  const ordersTabRef = useRef<HTMLButtonElement | null>(null);
  const profileTabRef = useRef<HTMLButtonElement | null>(null);

  const totalUnitsOrdered = orders.reduce((sum, order) => sum + order.totalUnits, 0);
  const totalSpendExVatPence = orders.reduce(
    (sum, order) => sum + order.subtotalExVatPence + order.deliveryExVatPence,
    0
  );
  const totalSpendIncVatPence = orders.reduce((sum, order) => sum + order.totalIncVatPence, 0);

  const openProformaOrders = orders.filter(isOpenProforma);
  const openProformaExVatPence = openProformaOrders.reduce(
    (sum, order) => sum + order.subtotalExVatPence + order.deliveryExVatPence,
    0
  );

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, current: AccountTab) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      let nextTab: AccountTab = current;
      if (e.key === 'Home') {
        nextTab = 'orders';
      } else if (e.key === 'End') {
        nextTab = 'profile';
      } else {
        nextTab = current === 'orders' ? 'profile' : 'orders';
      }
      setActiveTab(nextTab);
      if (nextTab === 'orders') {
        ordersTabRef.current?.focus();
      } else {
        profileTabRef.current?.focus();
      }
    }
  };

  const handleReorder = (order: SerializedOrderRecord) => {
    const items = Array.isArray(order.itemsJson) ? order.itemsJson : [];
    if (items.length === 0) return;

    clearBasket();
    for (const item of items) {
      addToBasket({
        sku: item.sku,
        title: item.title,
        slug: item.slug,
        quantity: item.quantity,
        basePriceExVatPence: item.basePriceExVatPence,
        finishOption: item.finishOption,
        finishName: item.finishName,
        mobilityOption: item.mobilityOption,
        mobilityName: item.mobilityName,
        primaryImage: item.primaryImage,
        unitPriceExVatPence: item.discountedUnitExVatPence,
        lineTotalExVatPence: item.lineSubtotalExVatPence,
      });
    }
    setDeliveryPostcode(order.postcode);
    setRequiresTailLift(Boolean(order.requiresTailLift));
    router.push('/checkout');
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback(null);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyNameInput.trim() || null,
          phone: phoneInput.trim() || null,
          defaultPostcode: defaultPostcodeInput.trim().toUpperCase() || null,
          defaultTailLift: Boolean(defaultTailLiftInput),
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Could not update your company & delivery profile.');
      }

      const updated = data.profile as Partial<ProfileState> | undefined;
      const nextProfile: ProfileState = {
        companyName: updated?.companyName ?? (companyNameInput.trim() || null),
        phone: updated?.phone ?? (phoneInput.trim() || null),
        defaultPostcode:
          updated?.defaultPostcode ?? (defaultPostcodeInput.trim().toUpperCase() || null),
        defaultTailLift:
          typeof updated?.defaultTailLift === 'boolean'
            ? updated.defaultTailLift
            : Boolean(defaultTailLiftInput),
      };

      setProfileState(nextProfile);
      setCompanyNameInput(nextProfile.companyName ?? '');
      setPhoneInput(nextProfile.phone ?? '');
      setDefaultPostcodeInput(nextProfile.defaultPostcode ?? '');
      setDefaultTailLiftInput(nextProfile.defaultTailLift);
      setProfileFeedback({
        type: 'success',
        message: 'Company & delivery defaults saved. Future checkouts will pre-fill automatically.',
      });
      router.refresh();
    } catch (err) {
      setProfileFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Unable to save profile changes. Please try again.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="bg-steel-50 min-h-screen text-steel-900 pb-16">
      {/* Header Banner */}
      <section className="bg-brand-navy text-surface-white border-b-4 border-stillage-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold ${
                    user.role === 'admin'
                      ? 'bg-accent-teal text-surface-white'
                      : 'bg-stillage-blue text-surface-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{user.role === 'admin' ? 'Administrator' : 'Trade Customer Account'}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-navyLight border border-white/15 font-mono text-xs text-steel-100">
                  <UserIcon className="w-3.5 h-3.5 text-stillage-sky" aria-hidden="true" />
                  <span>Signed in via {formatProviderLabel(user.provider)}</span>
                </span>
              </div>

              <div>
                <h1 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-wide text-surface-white">
                  {user.name || user.email}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-steel-200 font-mono">
                  <span>{user.email}</span>
                  {profileState.companyName && (
                    <span className="inline-flex items-center gap-1.5 text-stillage-sky">
                      <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{profileState.companyName}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {user.role === 'admin' && (
                <Link
                  href="/admin/analytics"
                  className="inline-flex items-center gap-2 bg-accent-teal hover:bg-teal-700 text-surface-white font-display font-bold uppercase tracking-wider text-sm px-4 py-2.5 rounded-lg transition-colors shadow-xs"
                >
                  <BarChart3 className="w-4 h-4" aria-hidden="true" />
                  <span>Admin Analytics</span>
                </Link>
              )}

              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-stillage-blue hover:bg-stillage-blueLight text-surface-white font-display font-bold uppercase tracking-wider text-sm px-5 py-2.5 rounded-lg transition-colors shadow-xs"
              >
                <span>Configure New Stillages</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-2 bg-brand-navyDark hover:bg-brand-navyLight border border-white/20 text-steel-100 font-display font-bold uppercase tracking-wider text-sm px-4 py-2.5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Access Notice Banner */}
        {adminNotice && !noticeDismissed && (
          <div
            role="status"
            className="bg-amber-50 border border-accent-amber rounded-lg p-4 flex items-start justify-between gap-4 text-brand-navy"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="w-5 h-5 text-accent-amber shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="text-sm space-y-0.5">
                <p className="font-bold">Administrator Access Required</p>
                <p className="text-steel-800">
                  Analytics and internal administration tools are restricted to authorised Stillage
                  Storage Solutions staff accounts. You are viewing your Trade Customer Account
                  portal.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNoticeDismissed(true)}
              className="text-xs font-mono font-bold text-steel-600 hover:text-brand-navy underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Summary KPI Row (3 Cards) */}
        <section aria-label="Account summary metrics" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-white border border-steel-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-steel-600">
                Total Orders
              </span>
              <PackageCheck className="w-5 h-5 text-stillage-blue" aria-hidden="true" />
            </div>
            <div className="mt-3">
              <div className="font-display font-bold text-3xl text-brand-navy">
                {orders.length}
              </div>
              <p className="mt-1 font-mono text-xs text-steel-600">
                {totalUnitsOrdered} stillage unit{totalUnitsOrdered === 1 ? '' : 's'} specified
              </p>
            </div>
          </div>

          <div className="bg-surface-white border border-steel-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-steel-600">
                Total Spend (Ex. / Inc. VAT)
              </span>
              <span className="px-2 py-0.5 rounded bg-steel-100 text-brand-navy font-mono text-[11px] font-bold">
                {showIncVat ? 'Inc. VAT' : 'Ex. VAT'}
              </span>
            </div>
            <div className="mt-3">
              <div className="font-display font-bold text-3xl text-brand-navy">
                {formatPrice(totalSpendExVatPence)}
              </div>
              <p className="mt-1 font-mono text-xs text-steel-600">
                Ex. VAT: {formatGBP(totalSpendExVatPence)} · Inc. VAT:{' '}
                {formatGBP(totalSpendIncVatPence)}
              </p>
            </div>
          </div>

          <div className="bg-surface-white border border-steel-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-steel-600">
                Open 30-Day Proformas
              </span>
              <FileText className="w-5 h-5 text-accent-amber" aria-hidden="true" />
            </div>
            <div className="mt-3">
              <div className="font-display font-bold text-3xl text-brand-navy">
                {openProformaOrders.length}
              </div>
              <p className="mt-1 font-mono text-xs text-steel-600">
                {openProformaOrders.length > 0
                  ? `${formatPrice(openProformaExVatPence)} ${showIncVat ? 'Inc. VAT' : 'Ex. VAT'} outstanding`
                  : 'All 30-day proforma invoices settled'}
              </p>
            </div>
          </div>
        </section>

        {/* 2-Tab Navigation */}
        <section className="space-y-6">
          <div
            role="tablist"
            aria-label="Customer account sections"
            className="flex flex-wrap items-center gap-2 border-b border-steel-200 pb-3 print:hidden"
          >
            <button
              ref={ordersTabRef}
              id={ordersTabId}
              type="button"
              role="tab"
              aria-selected={activeTab === 'orders'}
              aria-controls={ordersPanelId}
              tabIndex={activeTab === 'orders' ? 0 : -1}
              onClick={() => setActiveTab('orders')}
              onKeyDown={(e) => handleTabKeyDown(e, 'orders')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-bold uppercase tracking-wider text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'bg-stillage-blue text-surface-white shadow-xs'
                  : 'bg-surface-white text-brand-navy border border-steel-200 hover:border-stillage-blue'
              }`}
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>Previous Purchases &amp; Proformas ({orders.length})</span>
            </button>

            <button
              ref={profileTabRef}
              id={profileTabId}
              type="button"
              role="tab"
              aria-selected={activeTab === 'profile'}
              aria-controls={profilePanelId}
              tabIndex={activeTab === 'profile' ? 0 : -1}
              onClick={() => setActiveTab('profile')}
              onKeyDown={(e) => handleTabKeyDown(e, 'profile')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-bold uppercase tracking-wider text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'bg-stillage-blue text-surface-white shadow-xs'
                  : 'bg-surface-white text-brand-navy border border-steel-200 hover:border-stillage-blue'
              }`}
            >
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span>Company &amp; Delivery Profile</span>
            </button>
          </div>

          {/* Tab 1: Previous Purchases & Proformas */}
          <div
            id={ordersPanelId}
            role="tabpanel"
            aria-labelledby={ordersTabId}
            hidden={activeTab !== 'orders'}
            className={activeTab === 'orders' ? 'space-y-6' : 'hidden'}
          >
            {orders.length === 0 ? (
              <div className="bg-surface-white border border-steel-200 rounded-lg p-10 text-center space-y-5 shadow-xs">
                <div className="w-14 h-14 mx-auto rounded-lg bg-steel-100 border border-steel-200 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-stillage-blue" aria-hidden="true" />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <h2 className="font-display font-bold text-2xl uppercase text-brand-navy">
                    No Previous Purchases or Proformas Yet
                  </h2>
                  <p className="text-sm text-steel-600">
                    When you complete an instant Stripe checkout or generate a 30-day B2B VAT
                    Proforma Invoice while signed in with <strong>{user.email}</strong>, your full
                    stillage specifications, VAT invoices, and one-click reorder history appear here.
                  </p>
                </div>
                <div>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-stillage-blue hover:bg-stillage-blueDark text-surface-white font-display font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-lg transition-colors"
                  >
                    <span>Browse &amp; Configure Stillages</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((order) => {
                  const statusConfig = getOrderStatusConfig(order.status);
                  const orderTotalExVatPence = order.subtotalExVatPence + order.deliveryExVatPence;
                  const hasStripeInvoiceLinks = Boolean(
                    order.invoicePdfUrl || order.hostedInvoiceUrl
                  );
                  const lineItems = Array.isArray(order.itemsJson) ? order.itemsJson : [];

                  return (
                    <article
                      key={order.id}
                      className="bg-surface-white border border-steel-200 rounded-lg shadow-xs overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="bg-surface-slate border-b border-steel-200 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="font-mono font-bold text-base text-brand-navy">
                              {order.orderReference}
                            </h2>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-steel-100 border border-steel-200 text-steel-800 font-mono text-xs font-medium">
                              {formatPaymentModeLabel(order.paymentMode)}
                            </span>
                            {order.purchaseOrderNumber && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-surface-white border border-steel-200 text-brand-navy font-mono text-xs font-bold">
                                PO: {order.purchaseOrderNumber}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-steel-600">
                            <span>Ordered {formatUkDate(order.createdAt)}</span>
                            {order.invoiceNumber && (
                              <span>Invoice #{order.invoiceNumber}</span>
                            )}
                            {order.companyName && <span>{order.companyName}</span>}
                          </div>
                        </div>

                        <div className="text-left sm:text-right font-mono">
                          <div className="text-[11px] uppercase text-steel-600">
                            Order Total ({showIncVat ? 'Inc. VAT' : 'Ex. VAT'})
                          </div>
                          <div className="font-display font-bold text-2xl text-brand-navy">
                            {formatPrice(orderTotalExVatPence)}
                          </div>
                        </div>
                      </div>

                      {/* Delivery & VAT Breakdown Bar */}
                      <div className="px-5 py-3.5 border-b border-steel-200 bg-surface-white grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                        <div className="lg:col-span-6 flex flex-wrap items-start gap-2.5 text-steel-800">
                          <Truck
                            className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div className="space-y-0.5">
                            <div className="font-mono font-bold text-brand-navy">
                              Delivery: {order.postcode}
                              {order.deliveryZone ? ` · ${order.deliveryZone}` : ''}
                            </div>
                            <div className="text-steel-600">
                              Offloading:{' '}
                              <strong className="text-steel-900">
                                {order.requiresTailLift
                                  ? 'Tail-Lift Offloading + Pump Truck'
                                  : 'Forklift On-Site'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-6 flex flex-wrap items-center lg:justify-end gap-x-5 gap-y-1 font-mono text-steel-600">
                          <span>
                            Goods:{' '}
                            <strong className="text-steel-900">
                              {formatPrice(order.subtotalExVatPence)}
                            </strong>
                          </span>
                          <span>
                            HGV Freight:{' '}
                            <strong className="text-steel-900">
                              {formatPrice(order.deliveryExVatPence)}
                            </strong>
                          </span>
                          <span>
                            VAT (20%):{' '}
                            <strong className="text-steel-900">{formatGBP(order.vatPence)}</strong>
                          </span>
                          <span>
                            Inc. VAT:{' '}
                            <strong className="text-brand-navy">
                              {formatGBP(order.totalIncVatPence)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Line Items List */}
                      <div className="divide-y divide-steel-200">
                        {lineItems.map((item, idx) => (
                          <div
                            key={`${order.id}-${item.sku}-${item.finishOption}-${item.mobilityOption}-${idx}`}
                            className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3.5">
                              {item.primaryImage && (
                                <img
                                  src={item.primaryImage}
                                  alt={item.title}
                                  width={56}
                                  height={48}
                                  loading="lazy"
                                  className="w-14 h-12 object-contain bg-steel-50 p-1 border border-steel-200 rounded-md shrink-0"
                                />
                              )}
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[11px] font-bold bg-brand-navy text-surface-white px-1.5 py-0.5 rounded">
                                    {item.sku}
                                  </span>
                                  <Link
                                    href={`/products/${item.slug}`}
                                    className="font-bold text-sm text-brand-navy hover:text-stillage-blue transition-colors"
                                  >
                                    {item.title}
                                  </Link>
                                </div>
                                <div className="text-xs text-steel-600 flex flex-wrap gap-x-4 gap-y-0.5">
                                  <span>
                                    Finish:{' '}
                                    <strong className="text-steel-900">{item.finishName}</strong>
                                  </span>
                                  <span>
                                    Mobility:{' '}
                                    <strong className="text-steel-900">{item.mobilityName}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 font-mono text-xs shrink-0">
                              <div className="text-steel-600">
                                {item.quantity} × {formatPrice(item.discountedUnitExVatPence)}{' '}
                                <span className="text-[11px]">
                                  ({showIncVat ? 'Inc. VAT' : 'Ex. VAT'})
                                </span>
                              </div>
                              <div className="font-bold text-sm text-brand-navy">
                                {formatPrice(item.lineSubtotalExVatPence)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Actions */}
                      <div className="bg-steel-50 border-t border-steel-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {order.invoicePdfUrl && (
                            <a
                              href={order.invoicePdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-surface-white hover:bg-steel-100 border border-steel-200 text-brand-navy font-display font-bold uppercase tracking-wider text-xs px-3.5 py-2 rounded-lg transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-stillage-blue" aria-hidden="true" />
                              <span>Download VAT Invoice PDF</span>
                            </a>
                          )}

                          {order.hostedInvoiceUrl && (
                            <a
                              href={order.hostedInvoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-surface-white hover:bg-steel-100 border border-steel-200 text-brand-navy font-display font-bold uppercase tracking-wider text-xs px-3.5 py-2 rounded-lg transition-colors"
                            >
                              <ExternalLink
                                className="w-3.5 h-3.5 text-accent-amber"
                                aria-hidden="true"
                              />
                              <span>View Stripe Invoice</span>
                            </a>
                          )}

                          {!hasStripeInvoiceLinks && (
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="inline-flex items-center gap-1.5 bg-surface-white hover:bg-steel-100 border border-steel-200 text-brand-navy font-display font-bold uppercase tracking-wider text-xs px-3.5 py-2 rounded-lg transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-stillage-blue" aria-hidden="true" />
                              <span>Print VAT Summary</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          disabled={lineItems.length === 0}
                          className="inline-flex items-center gap-2 bg-stillage-blue hover:bg-stillage-blueDark disabled:opacity-50 text-surface-white font-display font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-colors shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Reorder to Basket</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tab 2: Company & Delivery Profile */}
          <div
            id={profilePanelId}
            role="tabpanel"
            aria-labelledby={profileTabId}
            hidden={activeTab !== 'profile'}
            className={activeTab === 'profile' ? 'block' : 'hidden'}
          >
            <div className="bg-surface-white border border-steel-200 rounded-lg p-6 sm:p-8 max-w-2xl shadow-xs space-y-6">
              <div className="border-b border-steel-200 pb-4 space-y-1">
                <h2 className="font-display font-bold text-2xl uppercase text-brand-navy">
                  Company &amp; Delivery Profile
                </h2>
                <p className="text-sm text-steel-600">
                  Saved trade account details are automatically pre-filled on the Stripe Checkout
                  and B2B VAT Proforma page for <strong>{user.email}</strong>.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label
                    htmlFor={companyFieldId}
                    className="flex items-center gap-1.5 font-mono text-xs font-bold text-steel-900 mb-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-stillage-blue" aria-hidden="true" />
                    <span>Company / Business Name</span>
                  </label>
                  <input
                    id={companyFieldId}
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    maxLength={120}
                    value={companyNameInput}
                    onChange={(e) => setCompanyNameInput(e.target.value)}
                    placeholder="e.g. Severn Valley Fabrications Ltd"
                    className="w-full px-3.5 py-2.5 border border-steel-200 rounded-lg text-sm text-steel-900 bg-surface-white focus:outline-none focus:border-stillage-blue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={phoneFieldId}
                      className="flex items-center gap-1.5 font-mono text-xs font-bold text-steel-900 mb-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-stillage-blue" aria-hidden="true" />
                      <span>Trade Contact Phone</span>
                    </label>
                    <input
                      id={phoneFieldId}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. 01978 800 500"
                      className="w-full px-3.5 py-2.5 border border-steel-200 rounded-lg font-mono text-sm text-steel-900 bg-surface-white focus:outline-none focus:border-stillage-blue"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={postcodeFieldId}
                      className="flex items-center gap-1.5 font-mono text-xs font-bold text-steel-900 mb-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stillage-blue" aria-hidden="true" />
                      <span>Default Delivery Postcode</span>
                    </label>
                    <input
                      id={postcodeFieldId}
                      name="defaultPostcode"
                      type="text"
                      autoComplete="postal-code"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={16}
                      value={defaultPostcodeInput}
                      onChange={(e) => setDefaultPostcodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. LL13 9UG"
                      className="w-full px-3.5 py-2.5 border border-steel-200 rounded-lg font-mono text-sm uppercase text-steel-900 bg-surface-white focus:outline-none focus:border-stillage-blue"
                    />
                  </div>
                </div>

                <div className="bg-surface-slate border border-steel-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      id={tailLiftFieldId}
                      name="defaultTailLift"
                      type="checkbox"
                      checked={defaultTailLiftInput}
                      onChange={(e) => setDefaultTailLiftInput(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-steel-200 accent-stillage-blue"
                    />
                    <div>
                      <label
                        htmlFor={tailLiftFieldId}
                        className="font-mono text-xs font-bold text-brand-navy cursor-pointer block"
                      >
                        Require HGV Tail-Lift Offloading + Pump Truck by Default (+£15.00 Ex. VAT)
                      </label>
                      <p className="text-xs text-steel-600 mt-0.5">
                        Leave unticked if your site has a forklift available for HGV side/rear
                        unloading.
                      </p>
                    </div>
                  </div>
                </div>

                {profileFeedback && (
                  <div
                    role={profileFeedback.type === 'error' ? 'alert' : 'status'}
                    aria-live="polite"
                    className={`rounded-lg border p-3.5 text-xs flex items-start gap-2.5 ${
                      profileFeedback.type === 'success'
                        ? 'bg-teal-50 border-accent-teal text-brand-navy'
                        : 'bg-red-50 border-red-600 text-red-950'
                    }`}
                  >
                    {profileFeedback.type === 'success' ? (
                      <CheckCircle2
                        className="w-4 h-4 text-accent-teal shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertTriangle
                        className="w-4 h-4 text-red-700 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-medium">{profileFeedback.message}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs text-steel-600">
                    VAT Invoices issued to: <strong className="text-brand-navy">{user.email}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 bg-stillage-blue hover:bg-stillage-blueDark disabled:opacity-60 text-surface-white font-display font-bold uppercase tracking-wider text-sm px-5 py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>{savingProfile ? 'Saving Profile...' : 'Save Company & Delivery Profile'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
