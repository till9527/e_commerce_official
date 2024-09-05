"use client";

import { useState } from "react";
import { emailOrderHistory } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOTP, verifyOTP } from "@/utils/otpService"; // Assume these are helper functions for OTP handling.

export default function MyOrdersPage() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false); // Step control
  const [verified, setVerified] = useState<boolean>(false); // OTP verification status
  const [message, setMessage] = useState<string | null>(null); // Status messages
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    try {
      await sendOTP(email); // Function to send OTP
      setOtpSent(true); // Move to OTP input step
      setError(null);
      setMessage("OTP sent to your email. Please enter it to proceed.");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const isValid = await verifyOTP(email, otp); // Function to verify OTP
      if (isValid) {
        setVerified(true); // Proceed to email order history
        setMessage("OTP verified. Fetching your order history...");
        setError(null);
        emailOrderHistory(email); // Call emailOrderHistory after verification
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
    }
  };

  return (
    <form className="max-2-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            Enter your email, and we will send you an OTP to verify your identity.
            After verifying, we&apos;ll email you your order history and download links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              required
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
            />
            {otpSent && (
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
              </>
            )}
            {error && <div className="text-destructive">{error}</div>}
            {message && <div className="text-success">{message}</div>}
          </div>
        </CardContent>
        <CardFooter>
          {!otpSent ? (
            <Button className="w-full" size="lg" onClick={handleSendOTP}>
              Send OTP
            </Button>
          ) : !verified ? (
            <Button className="w-full" size="lg" onClick={handleVerifyOTP}>
              Verify OTP
            </Button>
          ) : (
            <p>{message}</p>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
