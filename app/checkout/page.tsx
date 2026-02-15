"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Leaf, ArrowLeft, CreditCard, Smartphone, Building2, Check, Loader2 } from "lucide-react"
import { useCart } from "@/components/cart-provider"

type PaymentMethod = "card" | "upi" | "netbanking"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, count, clearCart } = useCart()
  const [method, setMethod] = useState<PaymentMethod>("card")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  if (items.length === 0 && !success) {
    router.push("/cart")
    return null
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setProcessing(false)
    setSuccess(true)
    clearCart()
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-accent" />
              <span className="font-serif text-xl text-foreground">Dorodango</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-col items-center justify-center gap-6 px-6 py-32">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Check className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-serif text-3xl text-foreground">Payment Successful</h1>
          <p className="max-w-md text-center leading-relaxed text-muted-foreground">
            Thank you for supporting sustainable fashion. Your artisan-crafted pieces will be on their way soon.
          </p>
          <Link
            href="/products"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-accent" />
            <span className="font-serif text-xl text-foreground">Dorodango</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="mt-4 font-serif text-3xl text-foreground md:text-4xl">Checkout</h1>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Payment Form */}
          <div className="flex-1">
            {/* Payment Method Selection */}
            <h2 className="font-serif text-xl text-foreground">Select Payment Method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                  method === "card"
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
              >
                <CreditCard className="h-6 w-6" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setMethod("upi")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                  method === "upi"
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
              >
                <Smartphone className="h-6 w-6" />
                UPI
              </button>
              <button
                type="button"
                onClick={() => setMethod("netbanking")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                  method === "netbanking"
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
              >
                <Building2 className="h-6 w-6" />
                Net Banking
              </button>
            </div>

            {/* Payment Details Form */}
            <form onSubmit={handlePay} className="mt-6 flex flex-col gap-4">
              {method === "card" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="card-name" className="text-sm font-medium text-foreground">Cardholder Name</label>
                    <input
                      id="card-name"
                      required
                      placeholder="Name on card"
                      className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="card-number" className="text-sm font-medium text-foreground">Card Number</label>
                    <input
                      id="card-number"
                      required
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="card-expiry" className="text-sm font-medium text-foreground">Expiry</label>
                      <input
                        id="card-expiry"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="card-cvv" className="text-sm font-medium text-foreground">CVV</label>
                      <input
                        id="card-cvv"
                        type="password"
                        required
                        placeholder="123"
                        maxLength={4}
                        className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </>
              )}

              {method === "upi" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="upi-id" className="text-sm font-medium text-foreground">UPI ID</label>
                  <input
                    id="upi-id"
                    required
                    placeholder="yourname@upi"
                    className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your UPI ID linked to any bank account (GPay, PhonePe, Paytm, etc.)
                  </p>
                </div>
              )}

              {method === "netbanking" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bank" className="text-sm font-medium text-foreground">Select Bank</label>
                  <select
                    id="bank"
                    required
                    className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose your bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                    <option value="bob">Bank of Baroda</option>
                    <option value="canara">Canara Bank</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    You will be redirected to your bank{"'"}s secure login page.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay {"₹"}{total.toLocaleString("en-IN")}</>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-72">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg text-foreground">Order Summary</h2>
              <div className="mt-4 flex flex-col gap-3 border-b border-border pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} {" x "}{item.qty}
                    </span>
                    <span className="text-foreground">{"₹"}{(item.price * item.qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-accent">Free</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-serif text-xl text-foreground">{"₹"}{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {count}{" artisan-crafted item"}{count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
