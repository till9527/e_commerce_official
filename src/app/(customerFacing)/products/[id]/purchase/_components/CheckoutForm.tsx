"use client";

import { userOrderExists } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { sendOTP, verifyOTP } from "@/utils/otpService"; // Assuming these helper functions are available.

type CheckoutFormProps = {
  product: {
    id: string;
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
  };
  clientSecret: string;
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export function CheckoutForm({ product, clientSecret }: CheckoutFormProps) {
  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
        </div>
      </div>
      <Elements options={{ clientSecret }} stripe={stripePromise}>
        <Form priceInCents={product.priceInCents} productId={product.id} />
      </Elements>
    </div>
  );
}

function Form({
  priceInCents,
  productId,
}: {
  priceInCents: number;
  productId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [otp, setOtp] = useState<string>(""); // OTP state
  const [otpSent, setOtpSent] = useState<boolean>(false); // OTP sent status
  const [verified, setVerified] = useState<boolean>(false); // OTP verification status
  const [message, setMessage] = useState<string | null>(null); // Message state

  const handleSendOTP = async () => {
    if (!email) {
      setErrorMessage("Please enter a valid email.");
      return;
    }
    try {
      await sendOTP(email);
      setOtpSent(true);
      setMessage("OTP sent to your email. Please verify to proceed.");
    } catch (err) {
      setErrorMessage("Failed to send OTP. Please try again.");
    }
  };
  


  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const isValid = await verifyOTP(email as string, otp);
      if (isValid) {
        setVerified(true);
        setMessage("OTP verified. You can now proceed with the payment.");
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setErrorMessage(<span style={{ color: 'black' }}>Failed to verify OTP. Please try again. You can ignore this error if you're seeing the credit card info box.</span>);
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();


    if (stripe==null||elements==null||!verified) {
      setErrorMessage(<span style={{ color: 'black' }}>Please verify OTP before proceeding. You can ignore this error if you're seeing the credit card info box.</span>);
      return;
    }

    setIsLoading(true);

    const orderExists = await userOrderExists(email as string, productId);

    if (orderExists) {
      setErrorMessage(
        "You have already purchased this product. Try downloading it from the My Orders page."
      );
      setIsLoading(false);
      return;
    }

    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error?.type === "card_error" || error?.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error occurred");
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
  <form onSubmit={handleSubmit}>
  <Card>
    <CardHeader>
      <CardTitle>Checkout</CardTitle>
      {errorMessage && (
        <CardDescription className="text-destructive">
          {errorMessage}
        </CardDescription>
      )}
    </CardHeader>
    <CardContent>
      <div className="mt-4">
       <div className={otpSent ? 'hidden' : ''}>
        <LinkAuthenticationElement
          onChange={(e) => setEmail(e.value.email)}
        />
      </div>
            {!otpSent && (
              <Button className="w-full mt-2" onClick={handleSendOTP}>
                Send OTP
              </Button>
            )}

        {/* Show the OTP input if OTP was sent and not yet verified */}
        {otpSent && !verified && (
          <>
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              type="text"
              required
              name="otp"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button className="w-full mt-2" onClick={handleVerifyOTP}>
              Verify OTP
            </Button>
          </>
        )}
        {message && <div className="text-success mt-2">{message}</div>}
      </div>
      {/* Show the PaymentElement only when the email is verified */}
      {verified && <PaymentElement />}
    </CardContent>
    <CardFooter>
      <Button
        className="w-full"
        size="lg"
        disabled={stripe == null || elements == null || isLoading || !verified}
      >
        {isLoading
          ? "Processing..."
          : `Purchase - ${formatCurrency(priceInCents / 100)}`}
      </Button>
    </CardFooter>
  </Card>
</form>

  );
}
