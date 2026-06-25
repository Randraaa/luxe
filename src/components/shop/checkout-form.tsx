"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAddress, calculateShipping, validateCoupon, createOrder } from "@/actions/checkout";
import { FadeIn } from "@/components/animations/fade-in";
import { toast } from "sonner";
import { Loader2, Plus, ArrowRight, ShieldCheck, MapPin, Truck, Ticket } from "lucide-react";

interface CheckoutFormProps {
  addresses: any[];
  subtotal: number;
  totalWeight: number;
  cartItems: any[];
}

export function CheckoutForm({ addresses, subtotal, totalWeight, cartItems }: CheckoutFormProps) {
  const router = useRouter();

  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipientName: "",
    phone: "",
    street: "",
    district: "",
    city: "",
    province: "",
    postalCode: "",
    isDefault: false,
  });
  const [isSubmitAddressLoading, setIsSubmitAddressLoading] = useState(false);

  // Courier State
  const [courier, setCourier] = useState("jne-reg");
  const [shippingCost, setShippingCost] = useState(9000);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  // Notes
  const [notes, setNotes] = useState("");

  // Place Order Loading
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  const handleCourierChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setCourier(selected);
    setIsShippingLoading(true);
    try {
      const cost = await calculateShipping(totalWeight, selected);
      setShippingCost(cost);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghitung ongkos kirim");
    } finally {
      setIsShippingLoading(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setIsCouponLoading(true);
    try {
      const res = await validateCoupon(couponCode, subtotal);
      if (res.valid && res.coupon && res.discountAmount !== undefined) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discountAmount);
        toast.success(`Kupon ${couponCode} berhasil diterapkan!`);
      } else {
        toast.error(res.error || "Gagal menerapkan kupon");
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem saat memvalidasi kupon");
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitAddressLoading(true);
    try {
      const res = await addAddress(addressForm);
      if (res.success && res.address) {
        toast.success("Alamat berhasil ditambahkan");
        setSelectedAddressId(res.address.id);
        setIsAddingAddress(false);
        setAddressForm({
          label: "",
          recipientName: "",
          phone: "",
          street: "",
          district: "",
          city: "",
          province: "",
          postalCode: "",
          isDefault: false,
        });
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menambahkan alamat");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitAddressLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Silakan pilih alamat pengiriman");
      return;
    }

    setIsOrderLoading(true);
    try {
      const res = await createOrder({
        addressId: selectedAddressId,
        courier,
        couponCode: appliedCoupon?.code,
        notes,
      });

      if (res.success && res.snapUrl) {
        toast.success("Pesanan berhasil dibuat!");
        router.push(res.snapUrl);
      } else {
        toast.error(res.error || "Gagal membuat pesanan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memproses pesanan.");
    } finally {
      setIsOrderLoading(false);
    }
  };

  const totalAmount = subtotal + shippingCost - discountAmount;

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
      {/* Checkout Form Details */}
      <div className="lg:col-span-2 space-y-8">
        {/* Shipping Address Section */}
        <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin size={18} className="text-neutral-500" />
              Alamat Pengiriman
            </h2>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="text-xs font-semibold text-neutral-600 hover:text-black dark:text-neutral-450 dark:hover:text-white flex items-center gap-1"
            >
              <Plus size={14} />
              Tambah Baru
            </button>
          </div>

          {/* Add Address Form overlay */}
          {isAddingAddress && (
            <FadeIn className="mb-6 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-905">
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-450">Label (e.g. Rumah)</label>
                    <input
                      type="text"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-450">Nama Penerima</label>
                    <input
                      type="text"
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-450">No Telepon</label>
                    <input
                      type="text"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-450">Kode Pos</label>
                    <input
                      type="text"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-450">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="Nama jalan, gedung, blok"
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-450">Kecamatan</label>
                    <input
                      type="text"
                      value={addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-450">Kota</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-450">Provinsi</label>
                    <input
                      type="text"
                      value={addressForm.province}
                      onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-black"
                  />
                  <label htmlFor="isDefault" className="text-xs text-neutral-500">Jadikan alamat utama</label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitAddressLoading}
                    className="h-9 px-4 rounded-md bg-black text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black"
                  >
                    {isSubmitAddressLoading ? "Saving..." : "Simpan Alamat"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="h-9 px-4 rounded-md border border-neutral-200 bg-white text-xs font-semibold hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </FadeIn>
          )}

          {/* List Addresses */}
          {addresses.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">
              Belum ada alamat pengiriman. Silakan tambah baru.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`relative flex cursor-pointer rounded-xl border p-4 transition-all hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 ${
                    selectedAddressId === address.id
                      ? "border-black dark:border-white bg-neutral-50/20"
                      : "border-neutral-100 dark:border-neutral-800/10 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="absolute right-4 top-4 h-4 w-4 accent-black"
                  />
                  <div className="pr-8 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-450">
                        {address.label}
                      </span>
                      {address.isDefault && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold">{address.recipientName}</p>
                    <p className="text-xs text-neutral-500">{address.phone}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {address.street}, {address.district}, {address.city}, {address.province}{" "}
                      {address.postalCode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* Courier Section */}
        <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Truck size={18} className="text-neutral-500" />
            Jasa Pengiriman
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-400">Pilih Kurir</label>
              <select
                value={courier}
                onChange={handleCourierChange}
                className="mt-1.5 h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <option value="jne-reg">JNE Regular (Rp 9.000 / kg)</option>
                <option value="jne-yes">JNE YES (Rp 18.000 / kg)</option>
                <option value="sicepat-reg">SiCepat Regular (Rp 8.000 / kg)</option>
                <option value="sicepat-best">SiCepat BEST (Rp 15.000 / kg)</option>
                <option value="jnt-reg">J&T Regular (Rp 9.000 / kg)</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <span className="text-xs text-neutral-400">Total berat kiriman</span>
              <span className="text-sm font-semibold mt-1">{(totalWeight / 1000).toFixed(2)} kg</span>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50">
          <label className="text-lg font-semibold flex items-center gap-2 mb-4">
            Catatan Tambahan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan untuk penjual atau kurir (opsional)"
            className="h-24 w-full rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900"
          />
        </section>
      </div>

      {/* Cart Summary Panel */}
      <div className="lg:col-span-1 space-y-6">
        <section className="rounded-2xl border border-neutral-100 bg-neutral-50/30 p-6 dark:border-neutral-800/10 dark:bg-neutral-900/10">
          <h2 className="text-lg font-semibold mb-6">Ringkasan Pesanan</h2>
          
          {/* Cart items list */}
          <div className="space-y-4 max-h-48 overflow-y-auto mb-6 pr-2">
            {cartItems.map((item) => {
              const activePrice = Number(item.product.discountPrice ?? item.product.price);
              return (
                <div key={item.id} className="flex gap-3 text-xs">
                  <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                    <img src={item.product.images?.[0]?.url} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.product.name}</p>
                    <p className="text-[10px] text-neutral-400">Qty: {item.quantity} | {item.variant.size}</p>
                  </div>
                  <span className="font-medium">
                    Rp {(activePrice * item.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Coupon input form */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2 border-t border-b border-neutral-100 py-4 mb-6 dark:border-neutral-850">
            <div className="relative flex-1">
              <Ticket className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-450" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Kode Kupon"
                className="h-9 w-full rounded-md border border-neutral-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-black dark:border-neutral-800 dark:bg-neutral-900"
              />
            </div>
            <button
              type="submit"
              disabled={isCouponLoading || !couponCode}
              className="h-9 px-4 rounded-md border bg-black text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {isCouponLoading ? <Loader2 size={12} className="animate-spin" /> : "Gunakan"}
            </button>
          </form>

          {/* Checkout calculations */}
          <div className="space-y-4 text-xs">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="font-semibold">Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Pengiriman ({courier.toUpperCase()})</span>
              <span className="font-semibold">
                {isShippingLoading ? <Loader2 size={12} className="animate-spin inline" /> : `Rp ${shippingCost.toLocaleString("id-ID")}`}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon Kupon</span>
                <span className="font-semibold">- Rp {discountAmount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="border-t border-neutral-100 pt-4 flex items-center justify-between text-sm dark:border-neutral-800/10">
              <span className="font-semibold">Total Pembayaran</span>
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                Rp {totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isOrderLoading || isShippingLoading}
            className="group mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {isOrderLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Buat Pesanan
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-neutral-450">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Pembayaran terenkripsi & aman</span>
          </div>
        </section>
      </div>
    </div>
  );
}
